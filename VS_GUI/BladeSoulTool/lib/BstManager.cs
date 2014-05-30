using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Diagnostics;
using System.Windows.Forms;
using System.ComponentModel;
using System.Net;

namespace BladeSoulTool
{
    class BstManager
    {
        private static BstManager instance;

        public static BstManager Instance 
        {
            get 
            {
                if (instance == null) 
                {
                    instance = new BstManager();
                }
                return instance;
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

        public const int ItemTypeCostume = 0;
        public const int ItemTypeAttach = 1;
        public const int ItemTypeWeapon = 2;

        public const string PathRoot = "../../../../";
        public const string PathConfig = "config/";
        public const string PathDatabase = "database/";
        public const string PathResources = "resources/";

        public const string PathVsRoot = "../../";
        public const string PathVsLog = "log/";
        public const string PathVsTmp = "tmp/";

        public const string PathLoadingGif = BstManager.PathRoot + BstManager.PathResources + "others/loading.gif";

        public const string GithubRoot = "https://raw.githubusercontent.com/agreatfool/BladeSoulTool/";
        public const string GithubBranch = "upk";

        public byte[] LoadingGif { get; set; }

        public JObject Settings { get; set; }
        public JObject CostumeData { get; set; }
        public JObject CostumeInvalidData { get; set; }
        public JObject AttachData { get; set; }
        public JObject AttachInvalidData { get; set; }
        public JObject WeaponData { get; set; }
        public JObject WeaponInvalidData { get; set; }

        public List<string> RaceNames { get; set; }
        public List<string> RaceTypes { get; set; }

        private void Init()
        {
            BstLogger.Instance.Log("[BstManager] Start to load json settings ...");
            this.Settings = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PathRoot + BstManager.PathConfig + "setting.json")));
            BstLogger.Instance.Log("[BstManager] Start to load json costumeData ...");
            this.CostumeData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PathRoot + BstManager.PathDatabase + "costume/data/data.json")));
            BstLogger.Instance.Log("[BstManager] Start to load json costumeInvalidData ...");
            this.CostumeInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PathRoot + BstManager.PathDatabase + "costume/data/data_invalid.json")));
            BstLogger.Instance.Log("[BstManager] Start to load json attachData ...");
            this.AttachData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PathRoot + BstManager.PathDatabase + "attach/data/data.json")));
            BstLogger.Instance.Log("[BstManager] Start to load json attachInvalidData ...");
            this.AttachInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PathRoot + BstManager.PathDatabase + "attach/data/data_invalid.json")));
            BstLogger.Instance.Log("[BstManager] Start to load json weaponData ...");
            this.WeaponData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PathRoot + BstManager.PathDatabase + "weapon/data/data.json")));
            BstLogger.Instance.Log("[BstManager] Start to load json weaponInvalidData ...");
            this.WeaponInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PathRoot + BstManager.PathDatabase + "weapon/data/data_invalid.json")));

            this.RaceNames = new List<string>();
            this.RaceNames.AddRange(new string[] {
                "天女", "人女", "人男", "龙女", "龙男", "灵女", "灵男"
            });
            this.RaceTypes = new List<string>();
            this.RaceTypes.AddRange(new string[] {
                "KunN", "JinF", "JinM", "GonF", "GonM", "LynF", "LynM"
            });

            this.LoadingGif = BstManager.GetBytesFromFile(BstManager.PathLoadingGif);
        }

        public JObject GetCostumeDataByRace(int raceId)
        {
            BstLogger.Instance.Log("[BstManager] GetCostumeDataByRace: " + raceId);

            var raceType = this.RaceTypes[raceId]; // 获取目标种族类型名

            var filtered = new JObject();

            foreach (var element in this.CostumeData.Properties())
            {
                var elementId = element.Name;
                var elementData = (JObject)element.Value;
                if ((string)elementData["race"] == raceType) 
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

            foreach (var element in this.AttachData.Properties())
            {
                var elementId = element.Name;
                var elementData = (JObject)element.Value;
                if ((string)elementData["race"] == raceType)
                {
                    filtered.Add(elementId, elementData);
                }
            }

            return filtered;
        }

        public static byte[] GetBytesFromWeb(string url)
        {
            byte[] bytes = null;
            if (url == null)
            {
                return null;
            }

            var webClient = new WebClient();

            try
            {
                bytes = webClient.DownloadData(url);
                return bytes;
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
                return bytes;
            }
        }

        public static byte[] GetBytesFromFile(string fullFilePath)
        {
            byte[] bytes = null;

            FileStream fs = null;
            if (!File.Exists(fullFilePath)) {
                return null; // 文件未找到，直接返回null
            }

            try
            {
                fs = File.OpenRead(fullFilePath);
                bytes = new byte[fs.Length];
                fs.Read(bytes, 0, Convert.ToInt32(fs.Length));
                return bytes;
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
                return bytes;
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

        public static string GetIconPicPath(JObject elementData)
        {
            string path = null;

            var iconPicName = (string)elementData["pic"];

            if (!string.IsNullOrEmpty(iconPicName))
            {
                path = BstManager.GithubRoot + BstManager.GithubBranch + "/" + BstManager.PathDatabase + "icon/png-cps/" + iconPicName;
            }

            return path;
        }

        public static string GetItemPicPath(int itemType, string itemId)
        {
            string path = null;
            switch (itemType)
            {
                case BstManager.ItemTypeCostume:
                    path = BstManager.GithubRoot + BstManager.GithubBranch + "/" + BstManager.PathDatabase +"costume/pics-cps/" + itemId + ".png";
                    break;
                case BstManager.ItemTypeAttach:
                    path = BstManager.GithubRoot + BstManager.GithubBranch + "/" + BstManager.PathDatabase + "attach/pics-cps/" + itemId + ".png";
                    break;
                case BstManager.ItemTypeWeapon:
                    path = BstManager.GithubRoot + BstManager.GithubBranch + "/" + BstManager.PathDatabase + "weapon/pics-cps/" + itemId + ".png";
                    break;
                default:
                    break;
            }
            return path;
        }

        public static void RunGrunt(TextBox box, string task = "", string[] args = null)
        {
            var worker = new BackgroundWorker();
            worker.DoWork += (s, e) =>
            {
                var proc = new Process();

                var cwd = Directory.GetCurrentDirectory() + "/" + BstManager.PathRoot;
                var cmd = "cmd.exe";
                var arguments = "/c grunt " + task + " " + ((args == null) ? "" : String.Join(" ", args)) + " --stack";
                // 打印命令信息
                var logMsg = "开始运行：\r\n" + "位置：" + cwd + "\r\n" + "命令：" + cmd + "\r\n" + "参数：" + arguments + "\r\n输出：\r\n";
                MethodInvoker logAction = () => box.AppendText(logMsg);
                BstLogger.Instance.Log(logMsg);
                box.BeginInvoke(logAction);

                proc.StartInfo.WorkingDirectory = cwd;
                proc.StartInfo.FileName = cmd;
                proc.StartInfo.Arguments = arguments;
                proc.StartInfo.UseShellExecute = false;
                proc.StartInfo.CreateNoWindow = true;
                proc.StartInfo.RedirectStandardError = true;
                proc.StartInfo.RedirectStandardOutput = true;

                proc.OutputDataReceived += (dataSender, dataE) =>
                {
                    // 注册输出接收事件
                    MethodInvoker outputAction = () =>
                    {
                        box.AppendText(dataE.Data + "\r\n");
                        BstLogger.Instance.Log(dataE.Data);
                    }; 
                    box.BeginInvoke(outputAction);
                };
                proc.Start(); // 启动
                proc.BeginOutputReadLine(); // 逐行读入输出
            };
            worker.RunWorkerCompleted += (s, e) => worker.Dispose();
            worker.RunWorkerAsync();
        }

    }
}
