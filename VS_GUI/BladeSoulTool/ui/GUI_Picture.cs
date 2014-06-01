using System;
using System.Windows.Forms;
using BladeSoulTool.lib;

namespace BladeSoulTool.ui
{
    public partial class GuiPicture : Form
    {
        public GuiPicture(int type, string elementId, TextBox box)
        {
            InitializeComponent();

            this.Shown += (s, e) => BstPicLoader.LoadPic(type, elementId, this.pictureBox2D, box); // 页面展示后的事件
        }
    }
}
