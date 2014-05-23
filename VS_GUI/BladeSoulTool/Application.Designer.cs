namespace BladeSoulTool
{
    partial class Application
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
            this.tabControl = new System.Windows.Forms.TabControl();
            this.tabCostume = new System.Windows.Forms.TabPage();
            this.tabAttach = new System.Windows.Forms.TabPage();
            this.tabWeapon = new System.Windows.Forms.TabPage();
            this.tabUtil = new System.Windows.Forms.TabPage();
            this.tabControl.SuspendLayout();
            this.SuspendLayout();
            // 
            // tabControl
            // 
            this.tabControl.Controls.Add(this.tabCostume);
            this.tabControl.Controls.Add(this.tabAttach);
            this.tabControl.Controls.Add(this.tabWeapon);
            this.tabControl.Controls.Add(this.tabUtil);
            this.tabControl.Location = new System.Drawing.Point(4, 3);
            this.tabControl.Name = "tabControl";
            this.tabControl.SelectedIndex = 0;
            this.tabControl.Size = new System.Drawing.Size(1185, 760);
            this.tabControl.TabIndex = 0;
            // 
            // tabCostume
            // 
            this.tabCostume.Location = new System.Drawing.Point(4, 21);
            this.tabCostume.Name = "tabCostume";
            this.tabCostume.Padding = new System.Windows.Forms.Padding(3);
            this.tabCostume.Size = new System.Drawing.Size(1177, 735);
            this.tabCostume.TabIndex = 0;
            this.tabCostume.Text = "tabCostume";
            this.tabCostume.UseVisualStyleBackColor = true;
            // 
            // tabAttach
            // 
            this.tabAttach.Location = new System.Drawing.Point(4, 21);
            this.tabAttach.Name = "tabAttach";
            this.tabAttach.Padding = new System.Windows.Forms.Padding(3);
            this.tabAttach.Size = new System.Drawing.Size(1177, 735);
            this.tabAttach.TabIndex = 1;
            this.tabAttach.Text = "tabAttach";
            this.tabAttach.UseVisualStyleBackColor = true;
            // 
            // tabWeapon
            // 
            this.tabWeapon.Location = new System.Drawing.Point(4, 21);
            this.tabWeapon.Name = "tabWeapon";
            this.tabWeapon.Padding = new System.Windows.Forms.Padding(3);
            this.tabWeapon.Size = new System.Drawing.Size(1177, 735);
            this.tabWeapon.TabIndex = 2;
            this.tabWeapon.Text = "tabWeapon";
            this.tabWeapon.UseVisualStyleBackColor = true;
            // 
            // tabUtil
            // 
            this.tabUtil.Location = new System.Drawing.Point(4, 21);
            this.tabUtil.Name = "tabUtil";
            this.tabUtil.Padding = new System.Windows.Forms.Padding(3);
            this.tabUtil.Size = new System.Drawing.Size(1177, 735);
            this.tabUtil.TabIndex = 3;
            this.tabUtil.Text = "tabUtil";
            this.tabUtil.UseVisualStyleBackColor = true;
            // 
            // GUI
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1192, 766);
            this.Controls.Add(this.tabControl);
            this.Name = "GUI";
            this.Text = "BladeSoulTool";
            this.tabControl.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TabControl tabControl;
        private System.Windows.Forms.TabPage tabCostume;
        private System.Windows.Forms.TabPage tabAttach;
        private System.Windows.Forms.TabPage tabWeapon;
        private System.Windows.Forms.TabPage tabUtil;

    }
}

