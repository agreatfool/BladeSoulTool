using System;
using System.Data;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using BladeSoulTool.lib;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool.ui
{
    public partial class GuiItems : Form
    {

        private int _formType;

        private DataTable _dataTable;

        private JObject _data;

        private string _selectedElementId;
        private string _originElementId;
        private string _targetElementId;

        private Thread _loadingThread;

        private JObject _originSettings;

        private BstI18NLoader _i18n;

        public GuiItems(int formType)
        {
            InitializeComponent();
            this.InitI18N();
            this.Init(formType);
            this.Shown += new EventHandler(GuiItems_Shown); // 页面展示后的事件
        }

        private void InitI18N()
        {
            this._i18n = BstI18NLoader.Instance;
            this.labelRace.Text = this._i18n.LoadI18NValue("GuiItems", "labelRace");
            this.btnView2DOrigin.Text = this._i18n.LoadI18NValue("GuiItems", "btnView2D");
            this.btnView3DOrigin.Text = this._i18n.LoadI18NValue("GuiItems", "btnView3D");
            this.labelOrigin.Text = this._i18n.LoadI18NValue("GuiItems", "labelOrigin");
            this.btnView2DTarget.Text = this._i18n.LoadI18NValue("GuiItems", "btnView2D");
            this.btnView3DTarget.Text = this._i18n.LoadI18NValue("GuiItems", "btnView3D");
            this.labelTarget.Text = this._i18n.LoadI18NValue("GuiItems", "labelTarget");
            this.btnTopRestoreAll.Text = this._i18n.LoadI18NValue("GuiItems", "btnTopRestoreAll");
            this.btnView3DInfo.Text = this._i18n.LoadI18NValue("GuiItems", "btnView3D");
            this.btnSelectTarget.Text = this._i18n.LoadI18NValue("GuiItems", "btnSelectTarget");
            this.btnSelectOrigin.Text = this._i18n.LoadI18NValue("GuiItems", "btnSelectOrigin");
            this.labelInfoHead.Text = this._i18n.LoadI18NValue("GuiItems", "labelInfoHead");
            this.btnReplace.Text = this._i18n.LoadI18NValue("GuiItems", "btnReplace");
        }

        private void Init(int formType)
        {
            this._formType = formType;
            this._originSettings = BstManager.ReadJsonFile(BstManager.GetItemOriginJsonPath(this._formType));
            // 数据列表
            this._dataTable = new DataTable();
            // icon列
            var columnIcon = new DataColumn("Icon")
            {
                DataType = Type.GetType("System.Byte[]"),
                AllowDBNull = true,
                ColumnName = this._i18n.LoadI18NValue("GuiItems", "tableColIcon")
            };
            //columnIcon.ReadOnly = true;
            this._dataTable.Columns.Add(columnIcon);
            // code列
            var columnCode = new DataColumn("Code") {
                ColumnName = this._i18n.LoadI18NValue("GuiItems", "tableColCode"),
                ReadOnly = true
            };
            this._dataTable.Columns.Add(columnCode);

            // 数据展示列表
            this.gridItems.DataSource = this._dataTable;
            this.gridItems.RowTemplate.Height = 64;
            // icon列
            var gridColumnIcon = this.gridItems.Columns[0];
            gridColumnIcon.AutoSizeMode = DataGridViewAutoSizeColumnMode.None;
            gridColumnIcon.Width = 64;
            // 展示列表点击事件
            this.gridItems.CellClick += new DataGridViewCellEventHandler(this.gridItems_CellClick);
            // 展示列表鼠标滚轴事件
            this.gridItems.MouseWheel += new MouseEventHandler(this.gridItems_MouseWheel);

            // 种族选择控件
            // ReSharper disable once CoVariantArrayConversion
            this.comboBoxRace.Items.AddRange(BstManager.Instance.RaceNames.ToArray());
            this.comboBoxRace.SelectedIndex = 0;
            this.comboBoxRace.SelectedIndexChanged += new EventHandler(this.comboBoxRace_SelectedIndexChanged);

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
        }

        private void GuiItems_Shown(object sender, EventArgs e)
        {
            // 当UI加载完毕开始显示之后才开始加载数据
            this.LoadItemList();
        }

        private void LoadItemList(int raceType = BstManager.RaceIdKunn)
        {
            if (this._loadingThread != null && this._loadingThread.IsAlive)
            {
                // 之前启动的加载线程还活着，需要先停止
                try
                {
                    this._loadingThread.Abort();
                }
                catch (Exception ex)
                {
                    BstLogger.Instance.Log(ex.ToString());
                }
                this._loadingThread = null;
            }

            this.ClearFormStatus(); // 清理旧的数据

            // 启动新的线程来处理数据加载内容
            this._loadingThread = new Thread(() =>
            {
                BstManager.ShowMsgInTextBox(this.textBoxOut, "开始加载数据列表数据 ...");

                BstManager.HideDataGridViewVerticalScrollBar(this.gridItems); // 隐藏滚动条

                // 更新原始模型区块数据
                JObject originData = null;
                if (this._formType == BstManager.TypeAttach
                    || this._formType == BstManager.TypeCostume)
                {
                    var race = BstManager.Instance.RaceTypes[raceType];
                    var data = (JObject) this._originSettings[race];
                    if (data != null)
                    {
                        this._originElementId = (string) data["id"];
                        originData = (JObject) data["data"];
                    }
                }
                else
                {
                    if (this._originSettings["id"] != null)
                    {
                        this._originElementId = (string) this._originSettings["id"];
                        originData = (JObject) this._originSettings["data"];
                    }
                }
                if (originData != null)
                {
                    this.LoadOriginAndTargetIconPic(this.pictureBoxOrigin, originData, true);
                    BstManager.ShowMsgInTextBox(this.textBoxOrigin, originData.ToString(), false);
                }

                // 初始化list数据
                switch (this._formType)
                {
                    case BstManager.TypeCostume:
                        this._data = BstManager.Instance.GetCostumeDataByRace(raceType);
                        break;
                    case BstManager.TypeAttach:
                        this._data = BstManager.Instance.GetAttachDataByRace(raceType);
                        break;
                    case BstManager.TypeWeapon:
                        this._data = BstManager.Instance.DataWeapon;
                        break;
                }
                // 加载list界面
                foreach (var element in this._data.Properties())
                {
                    // 读取数据
                    var elementId = element.Name;
                    var elementData = (JObject) element.Value;
                    // 填充数据
                    // 这里暂时不考虑做成动态的gif动画，考虑到列表里的项可能比较多，那么多timer更新gif动态图可能造成性能问题
                    this._dataTable.Rows.Add(new object[] { BstManager.Instance.LoadingGifBytes, elementId }); 
                    var rowId = this._dataTable.Rows.Count - 1;
                    BstIconLoader.Instance.RegisterTask(new BstIconLoadTask(
                        elementData, this.gridItems, this._dataTable, rowId, this.textBoxOut
                    ));
                }

                BstManager.ShowMsgInTextBox(this.textBoxOut, "数据列表加载完成，开始加载图片 ...");
                BstIconLoader.Instance.Start(); // 启动图片加载器
            });
            this._loadingThread.Start();
        }

        private void ClearFormStatus()
        {
            // 重置form的状态
            this._selectedElementId = null;
            this._originElementId = null;
            this._targetElementId = null;

            this.textBoxInfo.Text = null;
            this.textBoxOrigin.Text = null;
            this.textBoxTarget.Text = null;
            this.textBoxOut.Text = null;

            this.pictureBoxOrigin.Image = null;
            this.pictureBoxTarget.Image = null;
            this.pictureBoxUmodel.Image = null;

            this._data = null;
            this._dataTable.Clear();

            // 清空之前的加载队列，准备重新填充加载内容
            BstIconLoader.Instance.Stop();
        }

        private void gridItems_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0 || e.RowIndex > (this.gridItems.RowCount - 1))
            {
                return; // 索引越界
            }
            // 数据展示列表的点击事件
            this.gridItems.Rows[e.RowIndex].Selected = true;
            this.gridItems.Refresh();
            // 查找该行对应的数据
            this._selectedElementId = (string) this.gridItems.Rows[e.RowIndex].Cells[1].Value;
            var elementData = (JObject) this._data[this._selectedElementId];
            this.textBoxInfo.Text = elementData.ToString();
            // 模型截图控件
            BstPicLoader.LoadPic(this._formType, elementData, pictureBoxUmodel, this.textBoxOut);
        }

        private void gridItems_MouseWheel(Object sender, MouseEventArgs e)
        {
            // 数据展示列表的鼠标滚轴事件
            var currentIndex = this.gridItems.FirstDisplayedScrollingRowIndex;
            var scrollLines = SystemInformation.MouseWheelScrollLines;

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
            // 重新选择种族，即重新加载界面
            this.LoadItemList(this.comboBoxRace.SelectedIndex);
        }

        private void btnTopRestoreAll_Click(Object sender, EventArgs e)
        {
            // 恢复全部模型
            if (BstManager.DisplayConfirmMessageBox("确认操作", "确认恢复全部替换的模型？") == DialogResult.OK)
            {
                BstManager.Instance.RunGrunt(this.textBoxOut, "restore");
            }
        }

        private void btnView2DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型2D截图
            if (this._originElementId == null)
            {
                BstManager.DisplayErrorMessageBox("选择错误", "请先选择一个原始模型");
                return;
            }
            this.CreatePictureForm(this._originElementId);
        }

        private void btnView3DOrigin_Click(Object sender, EventArgs e)
        {
            // 预览原始模型的3D模型
            if (this._originElementId == null)
            {
                BstManager.DisplayErrorMessageBox("选择错误", "请先选择一个原始模型");
                return;
            }
            BstManager.Instance.RunGrunt(this.textBoxOut, "upk_viewer", new string[]
            {
                "--part=" + BstManager.GetTypeName(this._formType),
                "--model=" + this._originElementId
            });
        }

        private void btnView2DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型2D截图
            if (this._targetElementId == null)
            {
                BstManager.DisplayErrorMessageBox("选择错误", "请先选择一个目标模型");
                return;
            }
            this.CreatePictureForm(this._targetElementId);
        }

        private void btnView3DTarget_Click(Object sender, EventArgs e)
        {
            // 预览目标模型的3D模型
            if (this._targetElementId == null)
            {
                BstManager.DisplayErrorMessageBox("选择错误", "请先选择一个目标模型");
                return;
            }
            BstManager.Instance.RunGrunt(this.textBoxOut, "upk_viewer", new string[]
            {
                "--part=" + BstManager.GetTypeName(this._formType),
                "--model=" + this._targetElementId
            });
        }

        private void btnReplace_Click(Object sender, EventArgs e)
        {
            // 替换模型
            if (this._originElementId == null)
            {
                BstManager.DisplayErrorMessageBox("替换数据错误", "原始模型信息不得为空");
                return;
            }
            if (this._targetElementId == null)
            {
                BstManager.DisplayErrorMessageBox("替换数据错误", "目标模型信息不得为空");
                return;
            }
            if (this._originElementId == this._targetElementId)
            {
                BstManager.DisplayErrorMessageBox("替换数据错误", "目标模型不得与原始模型相同");
                return;
            }
            if (this._formType != BstManager.TypeCostume)
            {
                // FIXME
                BstManager.DisplayErrorMessageBox("功能未开放", "目前版本暂时只支持服装替换，请耐心等待下一个版本");
                return;
            }
            if (BstManager.DisplayConfirmMessageBox("确认操作", "确认执行替换操作？") == DialogResult.OK)
            {
                string race = null;
                if (this._formType == BstManager.TypeAttach
                    || this._formType == BstManager.TypeCostume)
                {
                    race = BstManager.Instance.RaceTypes[this.comboBoxRace.SelectedIndex];
                }
                BstManager.Instance.RunGrunt(this.textBoxOut, "replace", new string[]
                {
                    "--part=" + BstManager.GetTypeName(this._formType),
                    "--model=" + this._targetElementId,
                    "--race=" + race
                });
            }
        }

        private void btnView3DInfo_Click(Object sender, EventArgs e)
        {
            // 预览选中的对象的3D模型
            if (this._selectedElementId == null)
            {
                BstManager.DisplayErrorMessageBox("选择错误", "请先选择一个目标模型");
                return;
            }
            BstManager.Instance.RunGrunt(this.textBoxOut, "upk_viewer", new string[]
            {
                "--part=" + BstManager.GetTypeName(this._formType),
                "--model=" + this._selectedElementId
            });
        }

        private void btnSelectOrigin_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为原始模型
            if (this._selectedElementId == null)
            {
                BstManager.DisplayErrorMessageBox("选择错误", "请先选择一个目标模型");
                return; // 没有选中的元素，直接退出
            }
            var element = (JObject) this._data[this._selectedElementId];
            // 只有col1的模型才可以被设为原始模型
            var col = (string) element["col"];
            if (col != "col1")
            {
                BstManager.DisplayErrorMessageBox("选择错误", "只可将后缀最后为col1的模型设为原始模型");
                return;
            }
            this._originElementId = this._selectedElementId;
            // 展示icon，该icon应该已经有本地缓存，直接读取本地缓存
            this.LoadOriginAndTargetIconPic(this.pictureBoxOrigin, element);
            // 显示模型数据
            this.textBoxOrigin.Text = element.ToString();
            // 存储原始模型数据
            var originData = new JObject();
            originData["id"] = this._originElementId;
            originData["data"] = element;
            if (this._formType == BstManager.TypeAttach
                || this._formType == BstManager.TypeCostume)
            {
                this._originSettings[(string) element["race"]] = originData;
            }
            else
            {
                this._originSettings = originData;
            }
            BstManager.WriteJsonFile(BstManager.GetItemOriginJsonPath(this._formType), this._originSettings);
        }

        private void btnSelectTarget_Click(Object sender, EventArgs e)
        {
            // 将当前选中的物件设为目标模型
            if (this._selectedElementId == null)
            {
                BstManager.DisplayErrorMessageBox("选择错误", "请先选择一个目标模型");
                return; // 没有选中的元素，直接退出
            }
            this._targetElementId = this._selectedElementId;
            var element = (JObject) this._data[this._selectedElementId];
            // 展示icon，该icon应该已经有本地缓存，直接读取本地缓存
            this.LoadOriginAndTargetIconPic(this.pictureBoxTarget, element);
            // 显示模型数据
            this.textBoxTarget.Text = element.ToString();
        }

        private void CreatePictureForm(string elementId)
        {
            // 创建一个新的form来展示物件的2D截图
            var pictureForm = new GuiPicture(this._formType, elementId, this.textBoxOut);
            pictureForm.ShowDialog();
        }

        private void LoadOriginAndTargetIconPic(PictureBox picture, JObject elementData, bool async = false)
        {
            var cachePath = BstManager.GetIconPicTmpPath(elementData);
            if (async)
            {
                MethodInvoker picUpdate = delegate
                {
                    if (File.Exists(cachePath))
                    {
                        picture.ImageLocation = cachePath;
                    }
                    else
                    {
                        picture.ImageLocation = BstManager.GetIconPicUrl(elementData);
                    }
                    picture.Load();
                };
                picture.BeginInvoke(picUpdate);
            }
            else
            {
                if (File.Exists(cachePath))
                {
                    picture.ImageLocation = cachePath;
                }
                else
                {
                    picture.ImageLocation = BstManager.GetIconPicUrl(elementData);
                }
                picture.Load();
            }
        }

    }
}
