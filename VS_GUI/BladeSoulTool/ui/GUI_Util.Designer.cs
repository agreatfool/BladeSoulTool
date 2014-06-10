namespace BladeSoulTool.ui
{
    partial class GuiUtil
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.labelSelectGameDir = new System.Windows.Forms.Label();
            this.textBoxGameDir = new System.Windows.Forms.TextBox();
            this.btnSelectGameDir = new System.Windows.Forms.Button();
            this.textBoxOut = new System.Windows.Forms.TextBox();
            this.textBoxLicense = new System.Windows.Forms.TextBox();
            this.labelSelectLang = new System.Windows.Forms.Label();
            this.comboBoxSelectLang = new System.Windows.Forms.ComboBox();
            this.SuspendLayout();
            // 
            // labelSelectGameDir
            // 
            this.labelSelectGameDir.Location = new System.Drawing.Point(10, 9);
            this.labelSelectGameDir.Name = "labelSelectGameDir";
            this.labelSelectGameDir.Padding = new System.Windows.Forms.Padding(0, 6, 0, 0);
            this.labelSelectGameDir.Size = new System.Drawing.Size(117, 23);
            this.labelSelectGameDir.TabIndex = 0;
            this.labelSelectGameDir.Text = "设定游戏安装路径：";
            // 
            // textBoxGameDir
            // 
            this.textBoxGameDir.BackColor = System.Drawing.SystemColors.Window;
            this.textBoxGameDir.Location = new System.Drawing.Point(136, 10);
            this.textBoxGameDir.Name = "textBoxGameDir";
            this.textBoxGameDir.ReadOnly = true;
            this.textBoxGameDir.Size = new System.Drawing.Size(577, 21);
            this.textBoxGameDir.TabIndex = 1;
            // 
            // btnSelectGameDir
            // 
            this.btnSelectGameDir.Location = new System.Drawing.Point(719, 9);
            this.btnSelectGameDir.Name = "btnSelectGameDir";
            this.btnSelectGameDir.Size = new System.Drawing.Size(75, 23);
            this.btnSelectGameDir.TabIndex = 2;
            this.btnSelectGameDir.Text = "选择";
            this.btnSelectGameDir.UseVisualStyleBackColor = true;
            // 
            // textBoxOut
            // 
            this.textBoxOut.BackColor = System.Drawing.SystemColors.Window;
            this.textBoxOut.Location = new System.Drawing.Point(12, 411);
            this.textBoxOut.Multiline = true;
            this.textBoxOut.Name = "textBoxOut";
            this.textBoxOut.ReadOnly = true;
            this.textBoxOut.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.textBoxOut.Size = new System.Drawing.Size(1153, 165);
            this.textBoxOut.TabIndex = 3;
            // 
            // textBoxLicense
            // 
            this.textBoxLicense.BackColor = System.Drawing.SystemColors.Window;
            this.textBoxLicense.Location = new System.Drawing.Point(12, 582);
            this.textBoxLicense.Multiline = true;
            this.textBoxLicense.Name = "textBoxLicense";
            this.textBoxLicense.ReadOnly = true;
            this.textBoxLicense.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.textBoxLicense.Size = new System.Drawing.Size(1153, 148);
            this.textBoxLicense.TabIndex = 4;
            // 
            // labelSelectLang
            // 
            this.labelSelectLang.AutoSize = true;
            this.labelSelectLang.Location = new System.Drawing.Point(973, 14);
            this.labelSelectLang.Name = "labelSelectLang";
            this.labelSelectLang.Size = new System.Drawing.Size(65, 12);
            this.labelSelectLang.TabIndex = 5;
            this.labelSelectLang.Text = "选择语言：";
            // 
            // comboBoxSelectLang
            // 
            this.comboBoxSelectLang.FormattingEnabled = true;
            this.comboBoxSelectLang.Location = new System.Drawing.Point(1044, 10);
            this.comboBoxSelectLang.Name = "comboBoxSelectLang";
            this.comboBoxSelectLang.Size = new System.Drawing.Size(121, 20);
            this.comboBoxSelectLang.TabIndex = 6;
            // 
            // GuiUtil
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1177, 742);
            this.Controls.Add(this.comboBoxSelectLang);
            this.Controls.Add(this.labelSelectLang);
            this.Controls.Add(this.textBoxLicense);
            this.Controls.Add(this.textBoxOut);
            this.Controls.Add(this.btnSelectGameDir);
            this.Controls.Add(this.textBoxGameDir);
            this.Controls.Add(this.labelSelectGameDir);
            this.Name = "GuiUtil";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label labelSelectGameDir;
        private System.Windows.Forms.TextBox textBoxGameDir;
        private System.Windows.Forms.Button btnSelectGameDir;
        private System.Windows.Forms.TextBox textBoxOut;
        private System.Windows.Forms.TextBox textBoxLicense;
        private System.Windows.Forms.Label labelSelectLang;
        private System.Windows.Forms.ComboBox comboBoxSelectLang;


    }
}