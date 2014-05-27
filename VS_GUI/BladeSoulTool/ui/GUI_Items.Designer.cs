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
            this.imgUmodelSnapshot = new System.Windows.Forms.PictureBox();
            this.gridItems = new System.Windows.Forms.DataGridView();
            this.labelRace = new System.Windows.Forms.Label();
            this.comboBoxRace = new System.Windows.Forms.ComboBox();
            this.panelTarget = new System.Windows.Forms.Panel();
            this.panelDest = new System.Windows.Forms.Panel();
            this.btnTopRestoreAll = new System.Windows.Forms.Button();
            this.textBoxOut = new System.Windows.Forms.TextBox();
            this.panelInfo = new System.Windows.Forms.Panel();
            this.labelInfoHead = new System.Windows.Forms.Label();
            this.btnReplace = new System.Windows.Forms.Button();
            this.textBoxInfo = new System.Windows.Forms.TextBox();
            this.btnSelectOrigin = new System.Windows.Forms.Button();
            this.btnSelectTarget = new System.Windows.Forms.Button();
            this.labelOrigin = new System.Windows.Forms.Label();
            this.textBoxOrigin = new System.Windows.Forms.TextBox();
            this.labelTarget = new System.Windows.Forms.Label();
            this.pictureBoxOrigin = new System.Windows.Forms.PictureBox();
            this.btnView3DInfo = new System.Windows.Forms.Button();
            this.btnView3DOrigin = new System.Windows.Forms.Button();
            this.btnView3DTarget = new System.Windows.Forms.Button();
            this.pictureBoxTarget = new System.Windows.Forms.PictureBox();
            this.textBoxTarget = new System.Windows.Forms.TextBox();
            ((System.ComponentModel.ISupportInitialize)(this.imgUmodelSnapshot)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridItems)).BeginInit();
            this.panelTarget.SuspendLayout();
            this.panelDest.SuspendLayout();
            this.panelInfo.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxOrigin)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxTarget)).BeginInit();
            this.SuspendLayout();
            // 
            // imgUmodelSnapshot
            // 
            this.imgUmodelSnapshot.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.imgUmodelSnapshot.Location = new System.Drawing.Point(665, 130);
            this.imgUmodelSnapshot.Name = "imgUmodelSnapshot";
            this.imgUmodelSnapshot.Size = new System.Drawing.Size(500, 600);
            this.imgUmodelSnapshot.TabIndex = 0;
            this.imgUmodelSnapshot.TabStop = false;
            // 
            // gridItems
            // 
            this.gridItems.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.gridItems.BackgroundColor = System.Drawing.SystemColors.Window;
            this.gridItems.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.gridItems.Location = new System.Drawing.Point(12, 130);
            this.gridItems.Name = "gridItems";
            this.gridItems.RowTemplate.Height = 23;
            this.gridItems.Size = new System.Drawing.Size(459, 514);
            this.gridItems.TabIndex = 1;
            // 
            // labelRace
            // 
            this.labelRace.Location = new System.Drawing.Point(12, 5);
            this.labelRace.Name = "labelRace";
            this.labelRace.Padding = new System.Windows.Forms.Padding(0, 5, 0, 0);
            this.labelRace.Size = new System.Drawing.Size(65, 20);
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
            // panelTarget
            // 
            this.panelTarget.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.panelTarget.Controls.Add(this.btnView3DOrigin);
            this.panelTarget.Controls.Add(this.pictureBoxOrigin);
            this.panelTarget.Controls.Add(this.textBoxOrigin);
            this.panelTarget.Controls.Add(this.labelOrigin);
            this.panelTarget.Location = new System.Drawing.Point(14, 32);
            this.panelTarget.Name = "panelTarget";
            this.panelTarget.Size = new System.Drawing.Size(547, 92);
            this.panelTarget.TabIndex = 4;
            // 
            // panelDest
            // 
            this.panelDest.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.panelDest.Controls.Add(this.btnView3DTarget);
            this.panelDest.Controls.Add(this.pictureBoxTarget);
            this.panelDest.Controls.Add(this.textBoxTarget);
            this.panelDest.Controls.Add(this.labelTarget);
            this.panelDest.Location = new System.Drawing.Point(620, 32);
            this.panelDest.Name = "panelDest";
            this.panelDest.Size = new System.Drawing.Size(545, 92);
            this.panelDest.TabIndex = 5;
            // 
            // btnTopRestoreAll
            // 
            this.btnTopRestoreAll.Location = new System.Drawing.Point(219, 5);
            this.btnTopRestoreAll.Name = "btnTopRestoreAll";
            this.btnTopRestoreAll.Size = new System.Drawing.Size(75, 21);
            this.btnTopRestoreAll.TabIndex = 6;
            this.btnTopRestoreAll.Text = "全部还原";
            this.btnTopRestoreAll.UseVisualStyleBackColor = true;
            // 
            // textBoxOut
            // 
            this.textBoxOut.Enabled = false;
            this.textBoxOut.Location = new System.Drawing.Point(12, 650);
            this.textBoxOut.Multiline = true;
            this.textBoxOut.Name = "textBoxOut";
            this.textBoxOut.Size = new System.Drawing.Size(647, 80);
            this.textBoxOut.TabIndex = 8;
            // 
            // panelInfo
            // 
            this.panelInfo.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.panelInfo.Controls.Add(this.btnView3DInfo);
            this.panelInfo.Controls.Add(this.btnSelectTarget);
            this.panelInfo.Controls.Add(this.btnSelectOrigin);
            this.panelInfo.Controls.Add(this.textBoxInfo);
            this.panelInfo.Controls.Add(this.labelInfoHead);
            this.panelInfo.Location = new System.Drawing.Point(477, 130);
            this.panelInfo.Name = "panelInfo";
            this.panelInfo.Size = new System.Drawing.Size(182, 514);
            this.panelInfo.TabIndex = 9;
            // 
            // labelInfoHead
            // 
            this.labelInfoHead.Location = new System.Drawing.Point(3, 9);
            this.labelInfoHead.Name = "labelInfoHead";
            this.labelInfoHead.Size = new System.Drawing.Size(174, 17);
            this.labelInfoHead.TabIndex = 0;
            this.labelInfoHead.Text = "选中的模型信息：";
            // 
            // btnReplace
            // 
            this.btnReplace.Location = new System.Drawing.Point(567, 32);
            this.btnReplace.Name = "btnReplace";
            this.btnReplace.Size = new System.Drawing.Size(46, 92);
            this.btnReplace.TabIndex = 10;
            this.btnReplace.Text = "替换";
            this.btnReplace.UseVisualStyleBackColor = true;
            // 
            // textBoxInfo
            // 
            this.textBoxInfo.Enabled = false;
            this.textBoxInfo.Location = new System.Drawing.Point(5, 29);
            this.textBoxInfo.Multiline = true;
            this.textBoxInfo.Name = "textBoxInfo";
            this.textBoxInfo.Size = new System.Drawing.Size(170, 377);
            this.textBoxInfo.TabIndex = 1;
            // 
            // btnSelectOrigin
            // 
            this.btnSelectOrigin.Location = new System.Drawing.Point(5, 448);
            this.btnSelectOrigin.Name = "btnSelectOrigin";
            this.btnSelectOrigin.Size = new System.Drawing.Size(170, 23);
            this.btnSelectOrigin.TabIndex = 2;
            this.btnSelectOrigin.Text = "选为原始模型";
            this.btnSelectOrigin.UseVisualStyleBackColor = true;
            // 
            // btnSelectTarget
            // 
            this.btnSelectTarget.Location = new System.Drawing.Point(5, 480);
            this.btnSelectTarget.Name = "btnSelectTarget";
            this.btnSelectTarget.Size = new System.Drawing.Size(170, 23);
            this.btnSelectTarget.TabIndex = 3;
            this.btnSelectTarget.Text = "选为目标模型";
            this.btnSelectTarget.UseVisualStyleBackColor = true;
            // 
            // labelOrigin
            // 
            this.labelOrigin.Location = new System.Drawing.Point(1, 2);
            this.labelOrigin.Name = "labelOrigin";
            this.labelOrigin.Padding = new System.Windows.Forms.Padding(0, 22, 0, 0);
            this.labelOrigin.Size = new System.Drawing.Size(61, 85);
            this.labelOrigin.TabIndex = 0;
            this.labelOrigin.Text = "已设定的原始模型信息：";
            // 
            // textBoxOrigin
            // 
            this.textBoxOrigin.Enabled = false;
            this.textBoxOrigin.Location = new System.Drawing.Point(138, 3);
            this.textBoxOrigin.Multiline = true;
            this.textBoxOrigin.Name = "textBoxOrigin";
            this.textBoxOrigin.Size = new System.Drawing.Size(241, 84);
            this.textBoxOrigin.TabIndex = 1;
            // 
            // labelTarget
            // 
            this.labelTarget.Location = new System.Drawing.Point(3, 3);
            this.labelTarget.Name = "labelTarget";
            this.labelTarget.Padding = new System.Windows.Forms.Padding(0, 22, 0, 0);
            this.labelTarget.Size = new System.Drawing.Size(61, 85);
            this.labelTarget.TabIndex = 1;
            this.labelTarget.Text = "已选择的目标模型信息：";
            // 
            // pictureBoxOrigin
            // 
            this.pictureBoxOrigin.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pictureBoxOrigin.Location = new System.Drawing.Point(68, 12);
            this.pictureBoxOrigin.Name = "pictureBoxOrigin";
            this.pictureBoxOrigin.Size = new System.Drawing.Size(64, 64);
            this.pictureBoxOrigin.TabIndex = 2;
            this.pictureBoxOrigin.TabStop = false;
            // 
            // btnView3DInfo
            // 
            this.btnView3DInfo.Location = new System.Drawing.Point(5, 415);
            this.btnView3DInfo.Name = "btnView3DInfo";
            this.btnView3DInfo.Size = new System.Drawing.Size(170, 23);
            this.btnView3DInfo.TabIndex = 4;
            this.btnView3DInfo.Text = "预览3D模型";
            this.btnView3DInfo.UseVisualStyleBackColor = true;
            // 
            // btnView3DOrigin
            // 
            this.btnView3DOrigin.Location = new System.Drawing.Point(385, 3);
            this.btnView3DOrigin.Name = "btnView3DOrigin";
            this.btnView3DOrigin.Size = new System.Drawing.Size(42, 84);
            this.btnView3DOrigin.TabIndex = 3;
            this.btnView3DOrigin.Text = "预览3D模型";
            this.btnView3DOrigin.UseVisualStyleBackColor = true;
            // 
            // btnView3DTarget
            // 
            this.btnView3DTarget.Location = new System.Drawing.Point(387, 2);
            this.btnView3DTarget.Name = "btnView3DTarget";
            this.btnView3DTarget.Size = new System.Drawing.Size(42, 84);
            this.btnView3DTarget.TabIndex = 6;
            this.btnView3DTarget.Text = "预览3D模型";
            this.btnView3DTarget.UseVisualStyleBackColor = true;
            // 
            // pictureBoxTarget
            // 
            this.pictureBoxTarget.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pictureBoxTarget.Location = new System.Drawing.Point(70, 12);
            this.pictureBoxTarget.Name = "pictureBoxTarget";
            this.pictureBoxTarget.Size = new System.Drawing.Size(64, 64);
            this.pictureBoxTarget.TabIndex = 5;
            this.pictureBoxTarget.TabStop = false;
            // 
            // textBoxTarget
            // 
            this.textBoxTarget.Enabled = false;
            this.textBoxTarget.Location = new System.Drawing.Point(140, 3);
            this.textBoxTarget.Multiline = true;
            this.textBoxTarget.Name = "textBoxTarget";
            this.textBoxTarget.Size = new System.Drawing.Size(241, 84);
            this.textBoxTarget.TabIndex = 4;
            // 
            // GUI_Items
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1177, 742);
            this.Controls.Add(this.btnReplace);
            this.Controls.Add(this.panelInfo);
            this.Controls.Add(this.textBoxOut);
            this.Controls.Add(this.btnTopRestoreAll);
            this.Controls.Add(this.panelDest);
            this.Controls.Add(this.panelTarget);
            this.Controls.Add(this.comboBoxRace);
            this.Controls.Add(this.labelRace);
            this.Controls.Add(this.gridItems);
            this.Controls.Add(this.imgUmodelSnapshot);
            this.Name = "GUI_Items";
            this.Text = "GUI_Items";
            ((System.ComponentModel.ISupportInitialize)(this.imgUmodelSnapshot)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.gridItems)).EndInit();
            this.panelTarget.ResumeLayout(false);
            this.panelTarget.PerformLayout();
            this.panelDest.ResumeLayout(false);
            this.panelDest.PerformLayout();
            this.panelInfo.ResumeLayout(false);
            this.panelInfo.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxOrigin)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBoxTarget)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.PictureBox imgUmodelSnapshot;
        private System.Windows.Forms.DataGridView gridItems;
        private System.Windows.Forms.Label labelRace;
        private System.Windows.Forms.ComboBox comboBoxRace;
        private System.Windows.Forms.Panel panelTarget;
        private System.Windows.Forms.Panel panelDest;
        private System.Windows.Forms.Button btnTopRestoreAll;
        private System.Windows.Forms.TextBox textBoxOut;
        private System.Windows.Forms.Panel panelInfo;
        private System.Windows.Forms.Button btnReplace;
        private System.Windows.Forms.Label labelInfoHead;
        private System.Windows.Forms.TextBox textBoxInfo;
        private System.Windows.Forms.Button btnSelectTarget;
        private System.Windows.Forms.Button btnSelectOrigin;
        private System.Windows.Forms.Label labelOrigin;
        private System.Windows.Forms.TextBox textBoxOrigin;
        private System.Windows.Forms.Label labelTarget;
        private System.Windows.Forms.PictureBox pictureBoxOrigin;
        private System.Windows.Forms.Button btnView3DInfo;
        private System.Windows.Forms.Button btnView3DOrigin;
        private System.Windows.Forms.Button btnView3DTarget;
        private System.Windows.Forms.PictureBox pictureBoxTarget;
        private System.Windows.Forms.TextBox textBoxTarget;
        

    }
}