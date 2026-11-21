import unittest
from PIL import Image,ImageDraw
from pack_action_grids import clean
class CandidateTests(unittest.TestCase):
    def test_semitransparent_white_background_is_blocked(self):
        im=Image.new('RGBA',(64,64),(250,250,250,206));ImageDraw.Draw(im).rectangle((20,10,40,60),fill=(80,60,30,255))
        with self.assertRaisesRegex(ValueError,'background'):clean(im)
    def test_real_transparent_sprite_keeps_subject(self):
        im=Image.new('RGBA',(64,64));ImageDraw.Draw(im).rectangle((20,10,40,60),fill=(80,60,30,255));im.putpixel((2,2),(80,60,30,255))
        result=clean(im);self.assertEqual(result.getpixel((25,20)),(80,60,30,255));self.assertEqual(result.getpixel((2,2))[3],0)
    def test_empty_sprite_is_blocked(self):
        with self.assertRaisesRegex(ValueError,'Empty'):clean(Image.new('RGBA',(64,64)))
if __name__=='__main__':unittest.main(verbosity=2)
