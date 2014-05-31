namespace BladeSoulTool.ui
{
    partial class GuiPicture
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
            this.pictureBox2D = new System.Windows.Forms.PictureBox();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2D)).BeginInit();
            this.SuspendLayout();
            // 
            // pictureBox2D
            // 
            this.pictureBox2D.BackColor = System.Drawing.SystemColors.Window;
            this.pictureBox2D.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pictureBox2D.Location = new System.Drawing.Point(12, 12);
            this.pictureBox2D.Name = "pictureBox2D";
            this.pictureBox2D.Size = new System.Drawing.Size(500, 600);
            this.pictureBox2D.TabIndex = 0;
            this.pictureBox2D.TabStop = false;
            // 
            // GUI_Picture
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(523, 625);
            this.Controls.Add(this.pictureBox2D);
            this.Name = "GuiPicture";
            this.Text = "Picture";
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2D)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.PictureBox pictureBox2D;
    }
}