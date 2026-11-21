"""Synthetic pixel-regression checks. No artistic approval is created."""
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from gif2game import exact, make_clip

class PixelIntegrityTests(unittest.TestCase):
    def test_identical_rgba(self):
        a=Image.new("RGBA",(2,2),(20,30,40,255))
        self.assertTrue(exact(a,a.copy()))

    def test_opaque_rgb_change(self):
        a=Image.new("RGBA",(2,2),(20,30,40,255)); b=a.copy()
        b.putpixel((0,0),(200,30,40,255))
        self.assertFalse(exact(a,b))

    def test_partial_alpha_rgb_change(self):
        a=Image.new("RGBA",(2,2),(20,30,40,128)); b=a.copy()
        b.putpixel((0,0),(20,200,40,128))
        self.assertFalse(exact(a,b))

    def test_transparent_rgb_change(self):
        a=Image.new("RGBA",(2,2),(20,30,40,0)); b=a.copy()
        b.putpixel((0,0),(20,30,200,0))
        self.assertFalse(exact(a,b))

    def test_alpha_and_dimensions_change(self):
        a=Image.new("RGBA",(2,2),(20,30,40,255)); b=a.copy()
        b.putpixel((0,0),(20,30,40,0))
        self.assertFalse(exact(a,b))
        self.assertFalse(exact(a,Image.new("RGBA",(1,4),(20,30,40,255))))

    def test_synthetic_gif_atlas_roundtrip(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); assets=root/"assets";assets.mkdir()
            frames=[]
            for color in [(200,30,40),(20,200,40),(20,30,200)]:
                frame=Image.new("RGBA",(8,8),(0,0,0,0))
                for y in range(2,6):
                    for x in range(2,6):frame.putpixel((x,y),(*color,255))
                frames.append(frame)
            source=root/"synthetic.gif"
            frames[0].save(source,save_all=True,append_images=frames[1:],duration=[100,120,140],loop=0,disposal=2,optimize=False)
            clip=make_clip(source,assets)
            self.assertEqual(clip["frameCount"],3)
            self.assertTrue(clip["alpha"])
            with Image.open(source) as gif,Image.open(assets/clip["sheet"]) as atlas:
                sheet=atlas.convert("RGBA")
                for i in range(gif.n_frames):
                    gif.seek(i); original=gif.convert("RGBA")
                    x=(i%clip["cols"])*8;y=(i//clip["cols"])*8
                    restored=sheet.crop((x,y,x+8,y+8))
                    self.assertEqual(restored.tobytes(),original.tobytes())

if __name__=="__main__":
    unittest.main()

