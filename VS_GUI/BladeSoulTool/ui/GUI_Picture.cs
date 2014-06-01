using System.Windows.Forms;
using BladeSoulTool.lib;

namespace BladeSoulTool.ui
{
    public partial class GuiPicture : Form
    {
        public GuiPicture(int formType, string elementId, TextBox box)
        {
            InitializeComponent();

            BstPicLoader.LoadPic(
                BstManager.GetItemPicUrl(formType, elementId),
                elementId + ".png",
                BstManager.PathVsRoot + BstManager.PathVsTmp + BstManager.GetTypeName(formType) + "/" + elementId + ".png",
                this.pictureBox2D,
                box
            );
        }
    }
}
