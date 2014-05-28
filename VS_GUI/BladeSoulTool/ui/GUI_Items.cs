using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool
{
    public partial class GUI_Items : Form
    {

        private int formType;

        private DataTable dataTable;

        private JObject data;

        private string selectedElementId;
        private string originElementId;
        private string targetElementId;

        public GUI_Items(int formType)
        {
            InitializeComponent();
            this.init(formType);
        }

        private void init(int formType)
        {
            this.formType = formType;
            // 数据列表
            this.dataTable = new DataTable();
            // icon列
            DataColumn columnIcon = new DataColumn("Icon");
            columnIcon.DataType = System.Type.GetType("System.Byte[]");
            columnIcon.AllowDBNull = true;
            columnIcon.ColumnName = "缩略图";
            columnIcon.ReadOnly = true;
            this.dataTable.Columns.Add(columnIcon);
            // code列
            DataColumn columnCode = new DataColumn("Code");
            columnCode.ColumnName = "编号";
            columnCode.ReadOnly = true;
            this.dataTable.Columns.Add(columnCode);

            // 数据展示列表
            this.gridItems.DataSource = this.dataTable;
            this.gridItems.RowTemplate.Height = 64;
            // icon列
            DataGridViewColumn gridColumnIcon = this.gridItems.Columns[0];
            gridColumnIcon.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
            gridColumnIcon.Width = 64;
            // 展示列表点击事件
            this.gridItems.CellClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.gridItems_CellClick);
            // 展示列表鼠标滚轴事件
            this.gridItems.MouseWheel += new MouseEventHandler(this.gridItems_MouseWheel);

            // 种族选择控件
            this.comboBoxRace.Items.AddRange(BstManager.Instance.raceNames.ToArray());
            this.comboBoxRace.SelectedIndex = 0;
            this.comboBoxRace.SelectedIndexChanged +=new EventHandler(this.comboBoxRace_SelectedIndexChanged);

            // 全部恢复按钮
            this.btnTopRestoreAll.Click += new EventHandler(this.btnTopRestoreAll_Click);
            // 预览原始模型2D截图
            this.btnView2DOrigin.Click += new EventHandler(this.btnView2DOrigin_Click);
            // 预览原始模型3D模型
            this.btnView3DOrigin.Click += new EventHandler(this.btnView3DOrigin_Click);
            // 预览目标模型2D截图
            this.btnView2DTarget.Click += new EventHandler(this.btnView2DTarget_Click);
            // 预览目标模型3D模型
            this.btnView3DTarget.Click += new EventHandler(this.btnView3DTarget_Click);
            // 替换按钮
            this.btnReplace.Click += new EventHandler(this.btnReplace_Click);

            // 展示选中物件的3D模型按钮
            this.btnView3DInfo.Click += new EventHandler(this.btnView3DInfo_Click);
            // 选为原始模型按钮
            this.btnSelectOrigin.Click += new EventHandler(this.btnSelectOrigin_Click);
            // 选为目标模型按钮
            this.btnSelectTarget.Click += new EventHandler(this.btnSelectTarget_Click);

            // 按form类型做各自的逻辑处理
            // TODO 如何在UI界面加载完之后再加载数据，而且要一边加载数据一边更新tableUI
            //this.initFormData();
        }

        private void clearFormStatus()
        {
            // 重置form的状态
            this.selectedElementId = null;
            this.originElementId = null;
            this.targetElementId = null;

            this.textBoxInfo.Text = null;
            this.textBoxOrigin.Text = null;
            this.textBoxTarget.Text = null;
            this.textBoxOut.Text = null;

            this.pictureBoxOrigin.Image = null;
            this.pictureBoxTarget.Image = null;
            this.pictureBoxUmodel.Image = null;

            this.data = null;
            this.dataTable.Clear();
        }

        private void gridItems_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            // 数据展示列表的点击事件
            this.gridItems.Rows[e.RowIndex].Selected = true;
            this.gridItems.Refresh();
            // 查找该行对应的数据
            this.selectedElementId = (string)this.gridItems.Rows[e.RowIndex].Cells[1].Value;
            this.textBoxInfo.Text = this.data[this.selectedElementId].ToString();
            // 模型截图控件
            this.pictureBoxUmodel.ImageLocation = BstManager.getItemPicPath(this.formType, this.selectedElementId);
        }

        private void gridItems_MouseWheel(Object sender, MouseEventArgs e)
        {
            // 数据展示列表的鼠标滚轴事件
            int currentIndex = this.gridItems.FirstDisplayedScrollingRowIndex;
            int scrollLines = SystemInformation.MouseWheelScrollLines;

            if (e.Delta > 0)
            {
                this.gridItems.FirstDisplayedScrollingRowIndex = Math.Max(0, currentIndex - scrollLines);
            }
            else if (e.Delta < 0)
            {
                this.gridItems.FirstDisplayedScrollingRowIndex = currentIndex + scrollLines;
            }
        }

        private void comboBoxRace_SelectedIndexChanged(Object sender, EventArgs e)
        {
            // 重新选择种族信息
            this.clearFormStatus();
            this.initFormData(this.comboBoxRace.SelectedIndex);
        }

        private void btnTopRestoreAll_Click(Object sender, EventArgs e)
        {
            // 恢复全部模型
            Console.WriteLine("btnTopRestoreAll_Click");
        }

        private void btnView2DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型2D截图
            if (this.originElementId == null)
            {
                return;
            }
            this.createPictureForm(this.originElementId);
        }

        private void btnView3DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型的3D模型
            Console.WriteLine("btnView3DOrigin_Click");
        }

        private void btnView2DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型2D截图
            if (this.targetElementId == null)
            {
                return;
            }
            this.createPictureForm(this.targetElementId);
        }

        private void btnView3DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型的3D模型
            Console.WriteLine("btnView3DTarget_Click");
        }

        private void btnReplace_Click(Object sender, EventArgs e)
        {
            // 替换模型
            Console.WriteLine("btnReplace_Click");
            BstManager.runGrunt(this.textBoxOut);
        }

        private void btnView3DInfo_Click(Object sender, EventArgs e)
        {
            // 预览选中的对象的3D模型
            Console.WriteLine("btnView3DInfo_Click");
        }

        private void btnSelectOrigin_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为原始模型
            if (this.selectedElementId == null) 
            {
                return; // 没有选中的元素，直接退出
            }
            JObject element = (JObject)this.data[this.selectedElementId];
            // 只有col1的模型才可以被设为原始模型
            string col = (string)element["col"];
            if (col != "col1")
            {
                MessageBox.Show("只可将后缀最后为col1的模型设为原始模型", "选择错误", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }
            this.originElementId = this.selectedElementId;
            // 展示icon
            this.pictureBoxOrigin.ImageLocation = BstManager.getIconPath(element);
            this.pictureBoxOrigin.Load();
            // 显示模型数据
            this.textBoxOrigin.Text = element.ToString();
            // TODO 将选择好的原始模型数据写入到文件
        }

        private void btnSelectTarget_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为目标模型
            if (this.selectedElementId == null) 
            {
                return; // 没有选中的元素，直接退出
            }
            this.targetElementId = this.selectedElementId;
            JObject element = (JObject)this.data[this.selectedElementId];
            // 展示icon
            this.pictureBoxTarget.ImageLocation = BstManager.getIconPath(element);
            this.pictureBoxTarget.Load();
            // 显示模型数据
            this.textBoxTarget.Text = element.ToString();
        }

        private void initFormData(int raceType = BstManager.RACE_ID_KUNN)
        {
            // 初始化form数据
            // TODO 原始模型目标应该会被保存在磁盘上的某个配置文件内，这里需要读出
            // 并设置到 this.originElementId里，还要更新整个原始模型的cell控件
            switch (this.formType)
            {
                case App.FORM_TYPE_COSTUME:
                    this.initCostumeForm(raceType);
                    break;
                case App.FORM_TYPE_ATTACH:
                    this.initAttachForm(raceType);
                    break;
                case App.FORM_TYPE_WEAPON:
                    this.initWeaponForm(raceType);
                    break;
                default:
                    break;
            }
        }

        private void initCostumeForm(int raceType = BstManager.RACE_ID_KUNN)
        {
            // 初始化服装数据
            this.data = BstManager.Instance.getCostumeDataByRace(raceType);

            foreach (JProperty element in this.data.Properties())
            {
                // 读取数据
                string elementId = element.Name;
                JObject elementData = (JObject)element.Value;
                // 填充数据
                this.dataTable.Rows.Add(new object[] {
                    BstManager.getBytesFromFile(BstManager.getIconPath(elementData)), 
                    elementId
                });
            }
        }

        private void initAttachForm(int raceType = BstManager.RACE_ID_KUNN)
        {
            // 初始化饰品数据
            this.data = BstManager.Instance.getAttachDataByRace(raceType);

            foreach (JProperty element in this.data.Properties())
            {
                // 读取数据
                string elementId = element.Name;
                JObject elementData = (JObject)element.Value;
                // 填充数据
                this.dataTable.Rows.Add(new object[] {
                    BstManager.getBytesFromFile(BstManager.getIconPath(elementData)), 
                    elementId
                });
            }
        }

        private void initWeaponForm(int raceType = BstManager.RACE_ID_KUNN)
        {
            // 初始化武器数据
            this.data = BstManager.Instance.weaponData;

            foreach (JProperty element in this.data.Properties())
            {
                // 读取数据
                string elementId = element.Name;
                JObject elementData = (JObject)element.Value;
                // 填充数据
                this.dataTable.Rows.Add(new object[] {
                    BstManager.getBytesFromFile(BstManager.getIconPath(elementData)), 
                    elementId
                });
            }
        }

        private void createPictureForm(string elementId)
        {
            // 创建一个新的form来展示物件的2D截图
            string imgPath = BstManager.getItemPicPath(this.formType, elementId);
            Form pictureForm = new BladeSoulTool.ui.GUI_Picture(imgPath);
            pictureForm.Show();
        }

    }
}
