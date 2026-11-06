#!/usr/bin/env python3
"""Build the CC0 OGG library. Run in repository root: python3 audio/build_audio.py"""
from __future__ import annotations
import hashlib, io, json, math, os, pathlib, random, re, subprocess, tempfile, urllib.request, zipfile
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "audio"
LIB = OUT / "library"
SR = 44100
GAMES = {
 "King of Ash": ["sword_swing","sword_hit","sword_block","hurt","death","skeleton_rattle","step_stone","jump","boss_intro","ui_click","fire","music_arena","music_ash"],
 "Archer in the Fog": ["bow_draw","bow_release","arrow_hit","dragon_roar","monster_hurt","fireball","step_grass","wind","thunder","music_fog"],
 "Twilight Isle": ["sword_swing","sword_hit","magic_cast","monster_death","step_grass","step_sand","jump","wind","portal","music_twilight"],
 "Twilight Isle Classic": ["sword_swing","sword_hit","hurt","step_grass","step_stone","jump","ui_menu_open","music_twilight"],
 "Under and Above": ["step_water","water","bubble","deep_hum","fish_chirp","portal","step_stone","wind","music_underwater"],
 "ASQURA Office": ["office_keyboard","office_phone","office_coffee","office_steps","office_printer","office_glass_break","gunshot","gun_reload","rift_alarm","glitch","music_office"],
 "Foggy Awakening": ["wind","rain","thunder","storm","monster_hurt","glitch","portal","music_fog"],
 "ABYSS GLOW": ["bubble","deep_hum","fish_chirp","monster_hurt","monster_death","boss_intro","energy_pulse","music_abyss"],
 "Endless Valleys": ["step_stone","step_grass","sword_swing","sword_hit","jump","land","wind","music_valleys"],
 "Dreamverse": ["portal","rift_alarm","glitch","ui_menu_open","ui_click","ui_reward","ui_level_up","boss_intro","music_twilight"],
 "Rainbow Rush": ["cycle_whoosh","jump","land","wind","energy_pulse","glitch","ui_reward","ui_error","music_neon"]
}
# Every key is independently addressable; two nonidentical SFX variants, one looping music cue.
CATS = {
 "combat": ["sword_swing","sword_hit","sword_block","bow_draw","bow_release","arrow_hit","fireball","magic_cast","hurt","death","gunshot","gun_reload"],
 "creatures": ["skeleton_rattle","dragon_roar","monster_hurt","monster_death","fish_chirp"],
 "movement": ["step_stone","step_grass","step_sand","step_water","jump","land","cycle_whoosh"],
 "environment": ["wind","rain","thunder","fire","water","bubble","deep_hum","storm"],
 "ui": ["ui_click","ui_menu_open","ui_reward","ui_error","ui_level_up"],
 "events": ["rift_alarm","glitch","portal","boss_intro","energy_pulse"],
 "office": ["office_keyboard","office_phone","office_coffee","office_steps","office_printer","office_glass_break"],
 "music": ["music_arena","music_fog","music_twilight","music_underwater","music_office","music_abyss","music_valleys","music_neon","music_ash"]
}
SOURCES = [
 ("Kenney", "CC0", "https://opengameart.org/content/50-rpg-sound-effects",
  ["https://opengameart.org/sites/default/files/RPGsounds_Kenney.zip"],
  ["footstep","knife","metal","cloth","door","book","coin","creak"]),
 ("rubberduck", "CC0", "https://opengameart.org/content/80-cc0-rpg-sfx",
  ["https://opengameart.org/sites/default/files/80-CC0-RPG-SFX_0.zip",
   "https://opengameart.org/sites/default/files/80-CC0-RPG-SFX.zip"],
  ["blade","creature","monster","spell","fire","stone","metal"]),
 ("rubberduck", "CC0", "https://opengameart.org/content/80-cc0-creature-sfx",
  ["https://opengameart.org/sites/default/files/80-CC0-creature-SFX_0.zip",
   "https://opengameart.org/sites/default/files/80-CC0-creature-SFX.zip"],
  ["creature","monster","roar","grunt","hurt","cute","alien","burble"]),
 ("StarNinjas", "CC0", "https://opengameart.org/content/20-sword-sound-effects-attacks-and-clashes",
  ["https://opengameart.org/sites/default/files/sword_-_starninjas_1.zip",
   "https://opengameart.org/sites/default/files/sword_clash_-_starninjas_0.zip"],
  ["sword","attack","clash","swing"]),
 ("Kenney", "CC0", "https://opengameart.org/content/interface-sounds",
  ["https://opengameart.org/sites/default/files/kenney_interfaceSounds.zip",
   "https://opengameart.org/sites/default/files/kenney_interfaceSounds_0.zip"],
  ["click","interface","confirm","select","error"])
]
MATCH = {
 "sword_swing":r"sword|blade|knife|swing|slice", "sword_hit":r"sword|blade|clash|metal",
 "sword_block":r"clash|metal", "bow_draw":r"draw|cloth", "bow_release":r"knife|slice",
 "arrow_hit":r"chop|stone|wood", "fireball":r"fire|spell",
 "magic_cast":r"spell|magic", "hurt":r"hurt|grunt",
 "death":r"die|death", "gunshot":r"metal|attack", "gun_reload":r"metalclick|latch",
 "skeleton_rattle":r"chain|metal", "dragon_roar":r"roar|monster",
 "monster_hurt":r"hurt|grunt", "monster_death":r"die|death",
 "fish_chirp":r"cute|burble|weird", "step_stone":r"footstep|stone",
 "step_grass":r"footstep|cloth", "step_sand":r"footstep", "step_water":r"burble",
 "jump":r"cloth|footstep", "land":r"footstep|stone",
 "cycle_whoosh":r"swing|slice", "fire":r"fire", "water":r"burble",
 "bubble":r"burble|bubble", "ui_click":r"click|select|confirm",
 "ui_menu_open":r"open|confirm", "ui_reward":r"coin|gem",
 "ui_error":r"error|negative", "ui_level_up":r"confirm|positive",
 "office_keyboard":r"click|type", "office_phone":r"confirm|tone",
 "office_coffee":r"pot|water|burble", "office_steps":r"footstep",
 "office_printer":r"creak|paper", "office_glass_break":r"clash|break"
}
def inventory():
    tracked = subprocess.run(["git","ls-files","-z"],cwd=ROOT,stdout=subprocess.PIPE,check=True).stdout.decode("utf-8","replace").split("\0")
    paths = ("observer-world-en-v7/","observer-world-en-v2-audio/","underwater-world/","reference/sunken-city/","three-worlds-game/")
    hits = [p for p in tracked if p.startswith(paths) and
            (p.lower().endswith((".ogg",".wav",".mp3",".flac",".m4a",".aac",".opus",".mid",".midi"))
            or pathlib.PurePath(p).name.lower() in ("audio.js","sounds.js"))]
    lines = ["# Существующие звуки — инвентаризация перед импортом", "",
             "Обнаружены существующие музыкальные/звуковые движки и аудиофайлы. Ни один файл не заменяется.",
             "", "| Файл | Тип |", "|---|---|"]
    for p in sorted(hits):
        lines.append(f"| \`{p}\` | " + ("Синтез WebAudio (не OGG)" if p.endswith(".js") else "Аудиофайл") + " |")
    lines.append("")
    (OUT/"EXISTING_AUDIO.md").write_text("\n".join(lines),encoding="utf8")
    hashes=set()
    for p in tracked:
        if p.lower().endswith((".ogg",".wav",".mp3",".flac",".opus")) and (ROOT/p).is_file():
            hashes.add(hashlib.sha256((ROOT/p).read_bytes()).hexdigest())
    return hashes

def download_pools(folder):
    pool=[]
    for author,license,source,urls,_ in SOURCES:
        for url in urls:
            try:
                req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; meta6-audio-builder/1.0)"})
                with urllib.request.urlopen(req,timeout=25) as resp:
                    raw=resp.read(16*1024*1024+1)
                if len(raw)>16*1024*1024 or not zipfile.is_zipfile(io.BytesIO(raw)):
                    raise ValueError("not an audio ZIP")
                with zipfile.ZipFile(io.BytesIO(raw)) as arc:
                    for info in arc.infolist():
                        if info.is_dir() or not info.filename.lower().endswith((".ogg",".wav",".mp3",".flac")):
                            continue
                        if info.file_size>5*1024*1024: continue
                        data=arc.read(info)
                        if len(data)<128: continue
                        digest=hashlib.sha256(data).hexdigest()
                        if any(x["digest"]==digest for x in pool):continue
                        p=folder/(digest+pathlib.Path(info.filename).suffix.lower())
                        p.write_bytes(data)
                        pool.append(dict(path=p,name=pathlib.Path(info.filename).stem.lower(),
                                         author=author,license=license,source=source,digest=digest))
                print("CC0 source",source, len(pool))
                # StarNinjas has 2 separate ZIPs; attempt both.
                if author!="StarNinjas":break
            except Exception as exc:
                print("Source unavailable:",url,repr(exc))
    return pool

def synth_sfx(key, variant, path):
    seed=int(hashlib.sha256(f"{key}:{variant}".encode()).hexdigest()[:8],16)
    rng=np.random.default_rng(seed)
    long=key in {"wind","rain","storm","water","deep_hum","fire"}
    d=(4.0 if long else 0.22+seed%57/100)
    if key in {"thunder","dragon_roar","boss_intro","rift_alarm"}:d=1.65
    if key in {"bubble","office_phone","gun_reload"}:d=0.9
    n=int(SR*d);t=np.arange(n,dtype=np.float64)/SR; norm=t/d
    attack=np.minimum(1,t/(0.008 if not long else .2))
    release=np.minimum(1,(d-t)/(0.065 if not long else .4))
    env=np.maximum(0,attack*release)**(0.7 if not long else 1.5)
    f=70+(seed%420)
    phase=(f*t+(-0.3*f*norm*norm if "glitch" in key or "portal" in key else 0))
    tonal=np.sin(2*np.pi*phase)+.25*np.sin(2*np.pi*(2*phase+.08))
    noise=rng.normal(0,1,n)
    # For non-impulsive textures, filter the noise by a cheap low-pass.
    if any(s in key for s in ("wind","water","bubble","rain","deep","skeleton","creature","monster","fire","storm")):
        noise=np.convolve(noise,np.ones(25)/25,mode="same")
    if "step_" in key or key in {"land","sword_hit","arrow_hit","gunshot","office_keyboard"}:
        env*=np.exp(-10*norm)
    if key=="thunder":env=np.exp(-4*norm)*np.minimum(1,norm*80)
    if key in {"ui_click","ui_error","ui_reward","ui_level_up","energy_pulse"}: noise*=.12
    if key in {"wind","rain","storm","water","fire"}:tonal*=.05
    if key=="deep_hum":noise*=.12;tonal*=.9
    if key=="glitch":tonal=np.sign(np.sin(2*np.pi*(180+variant*38)*t))
    y=(.35*tonal+.42*noise)*env
    y=np.tanh(y*1.6)*.64
    import wave
    with wave.open(str(path),"wb") as wav:
        wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(SR)
        wav.writeframes(np.asarray(y*32760,dtype="<i2").tobytes())

def synth_music(key,path):
    seed=int(hashlib.sha256(key.encode()).hexdigest()[:8],16)
    rng=np.random.default_rng(seed)
    d=16; n=SR*d;t=np.arange(n,dtype=np.float32)/SR
    root={"music_arena":110,"music_fog":130.81,"music_twilight":146.83,
          "music_underwater":82.41,"music_office":164.81,"music_abyss":73.42,
          "music_valleys":123.47,"music_neon":196,"music_ash":98}[key]
    dark=key in {"music_abyss","music_fog","music_ash"}
    scale=[0,3,5,7,10] if dark else [0,2,5,7,9]
    melody=np.zeros(n,dtype=np.float32)
    step=0.5 if key=="music_neon" else 1.0
    for i in range(int(d/step)):
        start=int(i*step*SR);end=min(n,int((i+1)*step*SR))
        if end<=start:continue
        note=scale[(i*3+seed%5)%len(scale)]
        hz=root*2**(note/12)
        tt=np.arange(end-start,dtype=np.float32)/SR
        env=np.sin(np.pi*np.linspace(0,1,end-start,dtype=np.float32))**2
        melody[start:end]+=np.sin(2*np.pi*hz*tt)*env*.13
    bass=np.sin(2*np.pi*root/2*t)*.09
    pad=np.sin(2*np.pi*(root*2**(7/12))*t)*.035
    fade=np.minimum(1,np.minimum(t, d-t)/.4)
    y=(melody+bass+pad)*np.maximum(0,fade)
    # A short crossfade gives continuity of amplitude at loop boundary.
    p=int(SR*.2); blend=np.linspace(0,1,p,dtype=np.float32)
    y[:p]=y[:p]*blend+y[-p:]*(1-blend)
    y[-p:]=y[-p:]*(1-blend)+y[:p]*blend
    delay=round(.008*SR)
    stereo=np.stack([y, np.roll(y,delay)*.97],axis=1)
    import wave
    with wave.open(str(path),"wb") as wav:
        wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(SR)
        wav.writeframes(np.asarray(stereo*32760,dtype="<i2").tobytes())

def convert(src, dst, music=False):
    synthesized = src.stem.startswith(("generated_", "fallback_"))
    af=(["loudnorm=I=-16:TP=-2:LRA=11"] if music else
        ["loudnorm=I=-16:TP=-3:LRA=11"] if synthesized else
        ["silenceremove=start_periods=1:start_threshold=-55dB:stop_periods=1:stop_threshold=-55dB",
         "loudnorm=I=-16:TP=-3:LRA=11"])
    cmd=["ffmpeg","-nostdin","-v","error","-y","-i",str(src),"-vn",
         "-af",",".join(af),"-ac","2" if music else "1",
         "-ar","44100","-c:a","libvorbis","-q:a","3" if music else "4",str(dst)]
    subprocess.run(cmd,check=True,timeout=40)

def probe(p):
    cmd=["ffprobe","-v","error","-show_entries",
         "stream=codec_name,sample_rate,channels:format=duration","-of","json",str(p)]
    obj=json.loads(subprocess.check_output(cmd,text=True,timeout=10))
    st=obj["streams"][0]
    assert st["codec_name"]=="vorbis" and st["sample_rate"]=="44100"
    return round(float(obj["format"]["duration"]),3),int(st["channels"])

def main():
    OUT.mkdir(exist_ok=True)
    old_hashes=inventory()  # First, and before any source downloading.
    for cat in CATS:(LIB/cat).mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        td=pathlib.Path(tmp)
        pool=download_pools(td)
        used_sources=set(); hashes=set(old_hashes); entries=[]; by_action={}
        for cat,actions in CATS.items():
            for key in actions:
                count=1 if cat=="music" else 2
                for v in range(1,count+1):
                    dst=LIB/cat/f"{key}_{v:02d}.ogg"
                    used=None
                    # Prefer confirmed CC0 recorded sounds, no source file reused.
                    if cat!="music" and key in MATCH:
                        for item in pool:
                            if item["digest"] not in used_sources and re.search(MATCH[key],item["name"]):
                                used=item;break
                    try:
                        if used:
                            convert(used["path"],dst)
                            used_sources.add(used["digest"])
                        else:
                            wav=td/f"generated_{cat}_{key}_{v}.wav"
                            (synth_music(key,wav) if cat=="music" else synth_sfx(key,v,wav))
                            convert(wav,dst,music=(cat=="music"))
                        probe(dst)  # ffmpeg can return 0 but output an empty OGG after silence removal
                    except Exception as exc:
                        print("fallback synth",key,v,repr(exc))
                        used=None
                        wav=td/f"fallback_{key}_{v}.wav"
                        (synth_music(key,wav) if cat=="music" else synth_sfx(key,v,wav))
                        convert(wav,dst,music=(cat=="music"))
                    size=dst.stat().st_size
                    limit=1572864 if cat=="music" else 102400
                    if size>limit:raise RuntimeError(f"{dst} exceeds {limit}: {size}")
                    sha=hashlib.sha256(dst.read_bytes()).hexdigest()
                    if sha in hashes:raise RuntimeError(f"Duplicate sound: {dst}")
                    hashes.add(sha)
                    duration,channels=probe(dst)
                    source=(used["source"] if used else "https://github.com/mpaykin1/meta6/blob/main/audio/build_audio.py")
                    author=(used["author"] if used else "meta6 original procedural audio / project owner")
                    games=[g for g,need in GAMES.items() if key in need]
                    entry=dict(path=dst.relative_to(ROOT).as_posix(),category=cat,action=key,
                               games=games,source=source,author=author,license="CC0",
                               duration=duration,size=size,sha256=sha,channels=channels,
                               origin=(used["name"] if used else "Original procedural synthesis"))
                    entries.append(entry);by_action.setdefault(key,[]).append(entry["path"])
        (OUT/"manifest.json").write_text(json.dumps(entries,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
        need=["# SOUND NEEDS — Playgama", "",
              "События: целевой звуковой дизайн по описанию игр, без заявлений о проведённом live-прохождении.",
              "Два варианта для каждого эффекта; музыка предназначена для циклического воспроизведения.",""]
        for game,actions in GAMES.items():
            need += [f"## {game}","","| Событие в игре | Требуемый звук | Файлы |","|---|---|---|"]
            for key in actions:
                need.append("| "+key.replace("_"," ")+" | "+key+" | "+", ".join(f"\`{p}\`" for p in by_action[key])+" |")
            need.append("")
        (OUT/"SOUND_NEEDS.md").write_text("\n".join(need)+"\n",encoding="utf8")
        credits=["# CREDITS — звуковая библиотека", "",
                 "Все включённые файлы — CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/).",
                 "Исходные аудиофайлы при необходимости перекодированы в OGG Vorbis. Оригинальные синтезированные",
                 "звуки и партитуры созданы для проекта meta6, владелец посвящает их CC0 1.0.","",
                 "| Автор | Источник / лицензия |","|---|---|"]
        seen=set()
        for e in entries:
            k=(e["author"],e["source"])
            if k in seen:continue
            seen.add(k)
            credits.append(f'| {e["author"]} | {e["source"]} — CC0 1.0 |')
        credits += ["","Повторное распространение разрешено. Лицензии CC-BY в этой сборке не используются.",""]
        (OUT/"CREDITS.md").write_text("\n".join(credits),encoding="utf8")
        print("OUTPUT",len(entries),"OGGs",sum(e["size"] for e in entries),"bytes","recorded",len(used_sources))

if __name__=="__main__":
    main()
