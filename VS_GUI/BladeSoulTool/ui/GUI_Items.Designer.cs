namespace BladeSoulTool
{
    partial class GUI_Items
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
            this.umodelSnapshot = new System.Windows.Forms.PictureBox();
            this.dataSet1 = new System.Data.DataSet();
            ((System.ComponentModel.ISupportInitialize)(this.umodelSnapshot)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dataSet1)).BeginInit();
            this.SuspendLayout();
            // 
            // umodelSnapshot
            // 
            this.umodelSnapshot.Location = new System.Drawing.Point(674, 143);
            this.umodelSnapshot.Name = "umodelSnapshot";
            this.umodelSnapshot.Size = new System.Drawing.Size(500, 600);
            this.umodelSnapshot.TabIndex = 0;
            this.umodelSnapshot.TabStop = false;
            // 
            // dataSet1
            // 
            this.dataSet1.DataSetName = "NewDataSet";
            // 
            // GUI_Items
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1177, 746);
            this.Controls.Add(this.umodelSnapshot);
            this.Name = "GUI_Items";
            this.Text = "GUI_Items";
            ((System.ComponentModel.ISupportInitialize)(this.umodelSnapshot)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dataSet1)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.PictureBox umodelSnapshot;
        private System.Data.DataSet dataSet1;
        

    }
}