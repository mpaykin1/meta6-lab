/* Voxel Atmosphere Engine — independent Blockbench plugin. MIT.
 * No Blockbench GPL source is embedded. Designed for Blockbench 5.x.
 */
let vaeActions = [];
Plugin.register('voxel_atmosphere_engine', {
  title: 'Voxel Atmosphere Engine',
  author: 'Voxel Atmosphere Engine',
  description: 'Add editable low-poly forest props for atmospheric 3D games.',
  icon: 'forest',
  version: '0.1.0',
  min_version: '5.0.0',
  variant: 'both',
  onload() {
    const C = (name, from, to, palette=0) => ({name, from, to, palette});
    const recipes = {
      mushroom: [
        C('stem',[-3,0,-3],[3,9,3],5),
        C('door',[-1.15,0,3],[1.15,4,3.45],8),
        C('window_L',[-2.25,5,2.8],[-1,6.5,3.3],6),
        C('window_R',[1,5,2.8],[2.25,6.5,3.3],6),
        C('cap_brim',[-7,8,-7],[7,10,7],2),
        C('cap_top',[-5.8,10,-5.8],[5.8,12.4,5.8],2),
        C('cap_crown',[-3.7,12.4,-3.7],[3.7,14,3.7],2),
        C('cap_spot_a',[-4,12.5,-1],[-2,12.9,1],0),
        C('cap_spot_b',[1,13,2],[3.2,13.5,4],0),
      ],
      tree: [
        C('trunk',[-1.1,0,-1.1],[1.1,13,1.1],8),
        C('branch_L',[-4,9,-1.1],[-.7,10.2,1.1],8),
        C('branch_R',[.7,10,-1.1],[4,11,1.1],8),
        C('crown_base',[-6,10,-5],[6,16,5],3),
        C('crown_top',[-4.5,15,-4.5],[4.5,19,4.5],3),
        C('crown_left',[-7,12,-3],[-3,15,3],3),
        C('crown_right',[3,12,-4],[7,15,4],3),
      ],
      bonfire: [
        C('stone_N',[-2,.0,-5],[2,1,-3],7),
        C('stone_S',[-2,.0,3],[2,1,5],7),
        C('stone_E',[3,.0,-2],[5,1,2],7),
        C('stone_W',[-5,.0,-2],[-3,1,2],7),
        C('log_1',[-4,0,-1],[4,1.1,1],8),
        C('log_2',[-1,0,-4],[1,1.1,4],8),
        C('ember_base',[-1,1,-1],[1,3,1],6),
        C('flame_low',[-1.5,2,-1.5],[1.5,6,1.5],1),
        C('flame_high',[-.7,6,-.7],[.7,9,.7],4),
      ],
      lantern: [
        C('post',[-.4,0,-.4],[.4,12,.4],8),
        C('lamp',[-1.2,12,-1.2],[1.2,14.2,1.2],6),
        C('roof',[-1.8,14.2,-1.8],[1.8,14.8,1.8],7),
      ],
    };
    function addRecipe(type) {
      if (typeof Project === 'undefined' || !Project || typeof Cube === 'undefined' || typeof Group === 'undefined') {
        Blockbench.showQuickMessage('First open File → New → Generic Model');
        return;
      }
      const desc = recipes[type];
      if (!desc) return;
      try {
        Undo.initEdit({outliner: true, elements: []});
        const g = new Group({name: 'VAE_' + type}).init().addTo('root');
        const made = [];
        for (const b of desc) {
          const cube = new Cube({name: b.name, from: b.from, to: b.to, autouv: 1}).init().addTo(g);
          cube.setColor(b.palette);
          made.push(cube);
        }
        Undo.finishEdit('Voxel Atmosphere: ' + type, {outliner: true, elements: made});
        Canvas.updateView({elements: made, element_aspects: {geometry:true, faces:true, uv:true}, selection:true});
        Blockbench.showQuickMessage('Created editable ' + type + ' (' + made.length + ' cubes)');
      } catch (e) {
        Blockbench.showMessageBox({title:'Voxel Atmosphere Engine', message:String(e),buttons:['OK']});
      }
    }
    const actionDefs = [
      ['mushroom','Add mushroom house','house'],
      ['tree','Add voxel tree','park'],
      ['bonfire','Add bonfire','local_fire_department'],
      ['lantern','Add lantern','lightbulb'],
    ];
    for (const [type, name, icon] of actionDefs) {
      const action = new Action('vae_' + type,{name, description:name, icon, click:()=>addRecipe(type)});
      MenuBar.menus.tools.addAction(action);
      vaeActions.push(action);
    }
  },
  onunload() { vaeActions.forEach(a=>a.delete()); vaeActions=[]; }
});
