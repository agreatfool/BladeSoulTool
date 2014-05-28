using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace BladeSoulTool.ui
{
    public partial class GUI_Picture : Form
    {
        public GUI_Picture(string imgPath)
        {
            InitializeComponent();

            this.pictureBox2D.ImageLocation = imgPath;
            this.pictureBox2D.Load();
        }
    }
}
