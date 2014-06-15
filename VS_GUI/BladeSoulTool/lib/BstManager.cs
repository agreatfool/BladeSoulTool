using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Windows.Forms;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool.lib
{
    class BstManager
    {
        private static BstManager _instance;

        public static BstManager Instance 
        {
            get 
            {
                if (_instance == null) 
                {
                    _instance = new BstManager();
                }
                return _instance;
            }
        }

        private BstManager()
        {
            this.Init();
        }

        public const int RaceIdKunn = 0;
        public const int RaceIdJinf = 1;
        public const int RaceIdJinm = 2;
        public const int RaceIdGonf = 3;
        public const int RaceIdGonm = 4;
        public const int RaceIdLynf = 5;
        public const int RaceIdLynm = 6;

        public const int TypeCostume = 0;
        public const int TypeAttach = 1;
        public const int TypeWeapon = 2;
        public const int TypeUtil = 3;

        public const string PathRoot = "../../../../";
        public const string PathConfig = "config/";
        public const string PathDatabase = "database/";
        public const string PathResources = "resources/";

        public const string PathJsonSettings = BstManager.PathRoot + BstManager.PathConfig + "setting.json";
        public const string PathJsonCostume = BstManager.PathRoot + BstManager.PathDatabase + "costume/data/data.json";
        public const string PathJsonCostumeInvalid = BstManager.PathRoot + BstManager.PathDatabase + "costume/data/data_invalid.json";
        public const string PathJsonAttach = BstManager.PathRoot + BstManager.PathDatabase + "attach/data/data.json";
        public const string PathJsonAttachInvalid = BstManager.PathRoot + BstManager.PathDatabase + "attach/data/data_invalid.json";
        public const string PathJsonWeapon = BstManager.PathRoot + BstManager.PathDatabase + "weapon/data/data.json";
        public const string PathJsonWeaponInvalid = BstManager.PathRoot + BstManager.PathDatabase + "weapon/data/data_invalid.json";

        public const string PathVsRoot = "../../";
        public const string PathVsLog = "log/";
        public const string PathVsTmp = "tmp/";
        public const string PathVsConfig = "config/";

        public const string PathLoadingGif = BstManager.PathRoot + BstManager.PathResources + "others/loading.gif";

        public const string GithubRoot = "https://raw.githubusercontent.com/agreatfool/BladeSoulTool/";
        public const string GithubBranch = "master";

        public const string GithubVersionTxt = BstManager.GithubRoot + BstManager.GithubBranch + "/VERSION.txt";

        public const string ReleaseUrl17173 = "http://bbs.17173.com/thread-8018028-1-1.html";

        public const string PathI18N = BstManager.PathVsRoot + BstManager.PathVsConfig + "i18n-";

        public byte[] LoadingGifBytes { get; set; }

        public JObject SystemSettings { get; set; }
        public JObject DataCostume { get; set; }
        public JObject DataCostumeInvalid { get; set; }
        public JObject DataAttach { get; set; }
        public JObject DataAttachInvalid { get; set; }
        public JObject DataWeapon { get; set; }
        public JObject DataWeaponInvalid { get; set; }
        public JObject DataI18N { get; set; }

        public List<string> RaceNames { get; set; }
        public List<string> RaceTypes { get; set; }

        public List<string> LanguageNames { get; set; }
        public List<string> LanguageTypes { get; set; } 

        private bool _isGruntRunning = false;

        private void Init()
        {
            this.SystemSettings = BstManager.ReadJsonFile(BstManager.PathJsonSettings);
            this.DataCostume = BstManager.ReadJsonFile(BstManager.PathJsonCostume);
            this.DataCostumeInvalid = BstManager.ReadJsonFile(BstManager.PathJsonCostumeInvalid);
            this.DataAttach = BstManager.ReadJsonFile(BstManager.PathJsonAttach);
            this.DataAttachInvalid = BstManager.ReadJsonFile(BstManager.PathJsonAttachInvalid);
            this.DataWeapon = BstManager.ReadJsonFile(BstManager.PathJsonWeapon);
            this.DataWeaponInvalid = BstManager.ReadJsonFile(BstManager.PathJsonWeaponInvalid);

            var lang = (string) this.SystemSettings["lang"];
            this.DataI18N = BstManager.ReadJsonFile(BstManager.PathI18N + lang + ".json");

            var raceNamesInConfig = (JArray) this.DataI18N["Game"]["raceNames"];
            this.RaceNames = new List<string>();
            this.RaceNames.AddRange(
                raceNamesInConfig.ToObject<List<string>>()
            );
            this.RaceTypes = new List<string>();
            this.RaceTypes.AddRange(new string[] 
            {
                "KunN", "JinF", "JinM", "GonF", "GonM", "LynF", "LynM"
            });

            this.LanguageNames = new List<string>();
            this.LanguageNames.AddRange(new String[]
            {
                "简体中文", "English"
            });
            this.LanguageTypes = new List<string>();
            this.LanguageTypes.AddRange(new String[]
            {
                "zh_CN", "en_US"
            });

            this.LoadingGifBytes = BstManager.GetBytesFromFile(BstManager.PathLoadingGif);

            // 检查已配置的游戏地址配置
            var gamePath = (string) this.SystemSettings["path"]["game"];
            if (!string.IsNullOrEmpty(gamePath) && !Directory.Exists(gamePath))
            {
                // 游戏地址配置不存在，更新为null
                this.SystemSettings["path"]["game"] = null;
                BstManager.WriteJsonFile(BstManager.PathJsonSettings, this.SystemSettings);
            }
        }

        public static JObject ReadJsonFile(string path)
        {
            var content = (JObject) JToken.ReadFrom(new JsonTextReader(File.OpenText(path)));
            BstLogger.Instance.Log("Json file loaded: " + path);

            return content;
        }

        public JObject GetAllDataByType(int type)
        {
            JObject data = null;
            switch (type)
            {
                case BstManager.TypeAttach:
                    data = this.DataAttach;
                    break;
                case BstManager.TypeCostume:
                    data = this.DataCostume;
                    break;
                case BstManager.TypeWeapon:
                    data = this.DataWeapon;
                    break;
            }
            return data;
        }

        public JObject GetCostumeDataByRace(int raceId)
        {
            BstLogger.Instance.Log("[BstManager] GetCostumeDataByRace: " + raceId);

            var raceType = this.RaceTypes[raceId]; // 获取目标种族类型名

            var filtered = new JObject();

            foreach (var element in this.DataCostume.Properties())
            {
                var elementId = element.Name;
                var elementData = (JObject) element.Value;
                if ((string) elementData["race"] == raceType) 
                {
                    filtered.Add(elementId, elementData);
                }
            }

            return filtered;
        }

        public JObject GetAttachDataByRace(int raceId)
        {
            BstLogger.Instance.Log("[BstManager] GetAttachDataByRace: " + raceId);

            var raceType = this.RaceTypes[raceId]; // 获取目标种族类型名

            var filtered = new JObject();

            foreach (var element in this.DataAttach.Properties())
            {
                var elementId = element.Name;
                var elementData = (JObject) element.Value;
                if ((string) elementData["race"] == raceType)
                {
                    filtered.Add(elementId, elementData);
                }
            }

            return filtered;
        }

        public static void WriteJsonFile(string path, JObject json)
        {
            if (!File.Exists(path))
            {
                BstManager.CreateFile(path);
            }
            try
            {
                File.WriteAllText(path, json.ToString(Formatting.Indented));
            }
            catch (IOException ex)
            {
                BstLogger.Instance.Log(ex.ToString());
            }
        }

        public static byte[] DownloadImageFile(string url, string path)
        {
            var blob = BstManager.GetBytesFromWeb(url);
            if (blob == null)
            {
                return null; // 下载失败
            }
            BstManager.WriteByteArrayToFile(path, blob);

            return blob;
        }

        public static void DisplayErrorMessageBox(string boxTitle, string boxMsg)
        {
            MessageBox.Show(boxMsg, boxTitle, MessageBoxButtons.OK, MessageBoxIcon.Error);
        }

        public static DialogResult DisplayConfirmMessageBox(string boxTitle, string boxMsg)
        {
            return MessageBox.Show(boxMsg, boxTitle, MessageBoxButtons.OKCancel, MessageBoxIcon.Information);
        }

        public static DialogResult DisplayInfoMessageBox(string boxTitle, string boxMsg)
        {
            return MessageBox.Show(boxMsg, boxTitle, MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        public static void HideDataGridViewVerticalScrollBar(DataGridView grid)
        {
            MethodInvoker update = delegate
            {
                try
                {
                    grid.ScrollBars = ScrollBars.None;
                }
                catch (Exception ex)
                {
                    BstLogger.Instance.Log(ex.ToString());
                }
            };
            try
            {
                grid.BeginInvoke(update);
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
            }
        }

        public static void DisplayDataGridViewVerticalScrollBar(DataGridView grid)
        {
            MethodInvoker update = delegate
            {
                grid.ScrollBars = ScrollBars.Vertical;
            };
            try
            {
                grid.BeginInvoke(update);
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
            }
        }

        public static void CreateFile(string path)
        {
            File.Create(path).Dispose();
        }

        public static Bitmap ConvertByteToImage(byte[] blob)
        {
            var mStream = new MemoryStream();
            var pData = blob;
            mStream.Write(pData, 0, Convert.ToInt32(pData.Length));
            var bitmap = new Bitmap(mStream, false);
            mStream.Dispose();

            return bitmap;
        }

        public static void WriteByteArrayToFile(string path, byte[] blob)
        {
            FileStream fs = null;
            try
            {
                fs = new FileStream(path, FileMode.Create, FileAccess.Write);
                fs.Write(blob, 0, blob.Length);
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
            }
            finally
            {
                if (fs != null)
                {
                    fs.Close();
                    fs.Dispose();
                }
            }
        }

        public static string GetStringFromWeb(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return null;
            }

            var webClient = new WebClient();

            try
            {
                return webClient.DownloadString(url);
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
                return null;
            }
        }

        public static byte[] GetBytesFromWeb(string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return null;
            }

            var webClient = new WebClient();

            try
            {
                return webClient.DownloadData(url);
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
                return null;
            }
        }

        public static byte[] GetBytesFromFile(string path)
        {
            FileStream fs = null;
            if (!File.Exists(path)) {
                return null; // 文件未找到，直接返回null
            }

            try
            {
                fs = File.OpenRead(path);
                var bytes = new byte[fs.Length];
                fs.Read(bytes, 0, Convert.ToInt32(fs.Length));
                return bytes;
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
                return null;
            }
            finally
            {
                if (fs != null)
                {
                    fs.Close();
                    fs.Dispose();
                }
            }
        }

        public static string GetTypeName(int type)
        {
            var name = "attach";
            switch (type)
            {
                case BstManager.TypeAttach:
                    name = "attach";
                    break;
                case BstManager.TypeCostume:
                    name = "costume";
                    break;
                case BstManager.TypeWeapon:
                    name = "weapon";
                    break;
                default:
                    break;
            }
            return name;
        }

        public static string GetIconPicUrl(JObject elementData)
        {
            string path = null;

            var iconPicName = (string) elementData["pic"];

            if (!string.IsNullOrEmpty(iconPicName))
            {
                path = BstManager.GithubRoot + BstManager.GithubBranch + "/" + BstManager.PathDatabase + "icon/png-cps/" + iconPicName;
            }

            return path;
        }

        public static string GetIconPicTmpPath(JObject elementData)
        {
            string path = null;

            var iconPicName = (string) elementData["pic"];

            if (!string.IsNullOrEmpty(iconPicName))
            {
                path = BstManager.PathVsRoot + BstManager.PathVsTmp + "icon/" + iconPicName;
            }

            return path;
        }

        public static string GetItemPicUrl(int type, JObject elementData)
        {
            return BstManager.GithubRoot + BstManager.GithubBranch + "/" +
                BstManager.PathDatabase + BstManager.GetTypeName(type) + "/pics-cps/" +
                (string) elementData["core"] + "_" + (string) elementData["col"] + ".png";
        }

        public static string GetItemPicTmpPath(int type, JObject elementData)
        {
            return BstManager.PathVsRoot + BstManager.PathVsTmp +
                BstManager.GetTypeName(type) + "/" +
                (string) elementData["core"] + "_" + (string) elementData["col"] + ".png";
        }

        public static string GetItemOriginJsonPath(int type)
        {
            return BstManager.PathRoot + BstManager.PathDatabase + BstManager.GetTypeName(type) + "/data/origin.json";
        }

        public static void ShowMsgInTextBox(TextBox box, string msg, bool logInConsole = true)
        {
            if (box == null)
            {
                return; // TextBox对象不存在
            }
            else
            {
                MethodInvoker action = () => box.AppendText(msg + "\r\n");
                try
                {
                    box.BeginInvoke(action);
                }
                catch (InvalidOperationException ex)
                {
                    BstLogger.Instance.Log(ex.ToString()); // 有的时候在显示的时候TextBox已经被销毁，忽略错误
                }
            }
            if (logInConsole)
            {
                BstLogger.Instance.Log(msg);
            }
        }

        public void RunGrunt(TextBox box, string task = "", string[] args = null)
        {
            if (this._isGruntRunning)
            {
                BstLogger.Instance.Log(BstI18NLoader.Instance.LoadI18NValue("BstManager", "gruntAlreadyRun"));
                return; // 已经有grunt脚本在运行了，这里不再运行新的脚本
            }
            else
            {
                this._isGruntRunning = true;
            }

            var worker = new BackgroundWorker();
            worker.DoWork += (s, e) =>
            {
                var proc = new Process();

                var cwd = Directory.GetCurrentDirectory() + "/" + BstManager.PathRoot;
                const string cmd = "cmd.exe";
                var arguments = "/c grunt " + task + " " + ((args == null) ? "" : String.Join(" ", args)) + " --no-color --stack";
                // 打印命令信息
                var logMsg = string.Format(BstI18NLoader.Instance.LoadI18NValue("BstManager", "gruntStartLog"), cwd, cmd, arguments);
                BstManager.ShowMsgInTextBox(box, logMsg);

                proc.StartInfo.WorkingDirectory = cwd;
                proc.StartInfo.FileName = cmd;
                proc.StartInfo.Arguments = arguments;
                proc.StartInfo.UseShellExecute = false;
                proc.StartInfo.CreateNoWindow = true;
                proc.StartInfo.RedirectStandardError = true;
                proc.StartInfo.RedirectStandardOutput = true;

                proc.EnableRaisingEvents = true;
                proc.Exited += (es, ee) => BstManager.DisplayInfoMessageBox(
                    BstI18NLoader.Instance.LoadI18NValue("BstManager", "gruntResultTitle"),
                    BstI18NLoader.Instance.LoadI18NValue("BstManager", "gruntResultMsg")
                );

                proc.OutputDataReceived += (dataSender, dataE) => BstManager.ShowMsgInTextBox(box, dataE.Data); // 注册输出接收事件
                proc.Start(); // 启动
                proc.BeginOutputReadLine(); // 逐行读入输出
            };
            worker.RunWorkerCompleted += (s, e) =>
            {
                this._isGruntRunning = false;
                worker.Dispose();
            };
            worker.RunWorkerAsync();
        }

    }
}
