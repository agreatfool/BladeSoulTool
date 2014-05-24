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
            this.itemsGrid = new System.Windows.Forms.DataGridView();
            this.labelRace = new System.Windows.Forms.Label();
            this.comboBoxRace = new System.Windows.Forms.ComboBox();
            ((System.ComponentModel.ISupportInitialize)(this.umodelSnapshot)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.itemsGrid)).BeginInit();
            this.SuspendLayout();
            // 
            // umodelSnapshot
            // 
            this.umodelSnapshot.Location = new System.Drawing.Point(665, 130);
            this.umodelSnapshot.Name = "umodelSnapshot";
            this.umodelSnapshot.Size = new System.Drawing.Size(500, 600);
            this.umodelSnapshot.TabIndex = 0;
            this.umodelSnapshot.TabStop = false;
            // 
            // itemsGrid
            // 
            this.itemsGrid.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.itemsGrid.Location = new System.Drawing.Point(12, 130);
            this.itemsGrid.Name = "itemsGrid";
            this.itemsGrid.RowTemplate.Height = 23;
            this.itemsGrid.Size = new System.Drawing.Size(647, 600);
            this.itemsGrid.TabIndex = 1;
            // 
            // labelRace
            // 
            this.labelRace.AutoSize = true;
            this.labelRace.Location = new System.Drawing.Point(12, 9);
            this.labelRace.Name = "labelRace";
            this.labelRace.Size = new System.Drawing.Size(65, 12);
            this.labelRace.TabIndex = 2;
            this.labelRace.Text = "选择种族：";
            // 
            // comboBoxRace
            // 
            this.comboBoxRace.FormattingEnabled = true;
            this.comboBoxRace.Location = new System.Drawing.Point(83, 6);
            this.comboBoxRace.Name = "comboBoxRace";
            this.comboBoxRace.Size = new System.Drawing.Size(121, 20);
            this.comboBoxRace.TabIndex = 3;
            // 
            // GUI_Items
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1177, 742);
            this.Controls.Add(this.comboBoxRace);
            this.Controls.Add(this.labelRace);
            this.Controls.Add(this.itemsGrid);
            this.Controls.Add(this.umodelSnapshot);
            this.Name = "GUI_Items";
            this.Text = "GUI_Items";
            ((System.ComponentModel.ISupportInitialize)(this.umodelSnapshot)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.itemsGrid)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.PictureBox umodelSnapshot;
        private System.Windows.Forms.DataGridView itemsGrid;
        private System.Windows.Forms.Label labelRace;
        private System.Windows.Forms.ComboBox comboBoxRace;
        

    }
}