using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;
using BladeSoulTool.lib;

namespace BladeSoulTool.ui
{
    public partial class GuiUtil : Form
    {
        public GuiUtil()
        {
            InitializeComponent();
            this.Init();
        }

        private void Init()
        {
            // 读取已配置的游戏地址配置
            var gamePath = (string) BstManager.Instance.SystemSettings["path"]["game"];
            this.textBoxGameDir.Text = gamePath;

            this.btnSelectGameDir.Click += new EventHandler(btnSelectGameDir_Click); // 选择游戏安装路径
        }

        private void btnSelectGameDir_Click(Object sender, EventArgs e)
        {
            string path = "";

            var browser = new FolderBrowserDialog();
            var result = browser.ShowDialog();

            if (result == DialogResult.OK)
            {
                path = browser.SelectedPath;
                if (!File.Exists(path + "/bin/Client.exe"))
                {
                    const string boxTitle = "选择错误";
                    const string boxMsg = "选择的文件夹不是正确的游戏文件夹！";
                    MessageBox.Show(boxMsg, boxTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                else
                {
                    this.textBoxGameDir.Text = path;
                    BstManager.Instance.SystemSettings["path"]["game"] = path;
                    BstManager.WriteJsonFile(BstManager.PathJsonSettings, BstManager.Instance.SystemSettings);
                }
            }
        }
        
    }
}
