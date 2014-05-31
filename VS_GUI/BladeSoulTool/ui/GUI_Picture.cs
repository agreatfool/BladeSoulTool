using System.Windows.Forms;

namespace BladeSoulTool.ui
{
    public partial class GuiPicture : Form
    {
        public GuiPicture(string imgPath)
        {
            InitializeComponent();

            this.pictureBox2D.ImageLocation = imgPath;
            this.pictureBox2D.Load();
        }
    }
}
