using System.Drawing;
using System.Drawing.Imaging;

namespace BladeSoulTool.lib
{
    public class BstGifImage
    {
        private readonly Image _gifImage;
        private readonly FrameDimension _dimension;
        private readonly int _frameCount;
        private int _currentFrame = -1;
        private bool _reverse;
        private int _step = 1;

        public BstGifImage(string path)
        {
            this._gifImage = Image.FromFile(path); // initialize
            this._dimension = new FrameDimension(this._gifImage.FrameDimensionsList[0]); // gets the GUID
            this._frameCount = this._gifImage.GetFrameCount(this._dimension); // total frames in the animation
        }

        public bool ReverseAtEnd
        {
            // whether the gif should play backwards when it reaches the end
            get { return this._reverse; }
            set { this._reverse = value; }
        }

        public Image GetNextFrame()
        {

            this._currentFrame += this._step;

            // if the animation reaches a boundary ...
            if (this._currentFrame >= this._frameCount || this._currentFrame < 1)
            {
                if (this._reverse)
                {
                    this._step *= -1;
                    // ... reverse the count
                    // apply it
                    this._currentFrame += this._step;
                }
                else
                {
                    //...or start over
                    this._currentFrame = 0;
                }
            }
            return this.GetFrame(this._currentFrame);
        }

        public Image GetFrame(int index)
        {
            this._gifImage.SelectActiveFrame(_dimension, index); // find the frame
            return (Image) this._gifImage.Clone(); // return a copy of it
        }
    }
}
