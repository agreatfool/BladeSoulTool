using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Diagnostics;
using System.Windows.Forms;
using System.ComponentModel;

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
            this.init();
        }

        public const int RACE_ID_KUNN = 0;
        public const int RACE_ID_JINF = 1;
        public const int RACE_ID_JINM = 2;
        public const int RACE_ID_GONF = 3;
        public const int RACE_ID_GONM = 4;
        public const int RACE_ID_LYNF = 5;
        public const int RACE_ID_LYNM = 6;

        public const int ITEM_TYPE_COSTUME = 0;
        public const int ITEM_TYPE_ATTACH = 1;
        public const int ITEM_TYPE_WEAPON = 2;

        public const string PATH_ROOT = "../../../../";
        public const string PATH_CONFIG = BstManager.PATH_ROOT + "config/";
        public const string PATH_DATABASE = BstManager.PATH_ROOT + "database/";

        public JObject settings { get; set; }
        public JObject costumeData { get; set; }
        public JObject costumeInvalidData { get; set; }
        public JObject attachData { get; set; }
        public JObject attachInvalidData { get; set; }
        public JObject weaponData { get; set; }
        public JObject weaponInvalidData { get; set; }

        public List<string> raceNames { get; set; }
        public List<string> raceTypes { get; set; }

        private void init()
        {
            this.settings = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PATH_CONFIG + "setting.json")));
            this.costumeData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PATH_DATABASE + "costume/data/data.json")));
            this.costumeInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PATH_DATABASE + "costume/data/data_invalid.json")));
            this.attachData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PATH_DATABASE + "attach/data/data.json")));
            this.attachInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PATH_DATABASE + "attach/data/data_invalid.json")));
            this.weaponData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PATH_DATABASE + "weapon/data/data.json")));
            this.weaponInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(BstManager.PATH_DATABASE + "weapon/data/data_invalid.json")));

            this.raceNames = new List<string>();
            this.raceNames.AddRange(new string[] {
                "天女", "人女", "人男", "龙女", "龙男", "灵女", "灵男"
            });
            this.raceTypes = new List<string>();
            this.raceTypes.AddRange(new string[] {
                "KunN", "JinF", "JinM", "GonF", "GonM", "LynF", "LynM"
            });
        }

        public JObject getCostumeDataByRace(int raceId)
        {
            string raceType = this.raceTypes[raceId]; // 获取目标种族类型名

            JObject filtered = new JObject();

            foreach (JProperty element in this.costumeData.Properties())
            {
                string elementId = element.Name;
                JObject elementData = (JObject)element.Value;
                if ((string)elementData["race"] == raceType) 
                {
                    filtered.Add(elementId, elementData);
                }
            }

            return filtered;
        }

        public JObject getAttachDataByRace(int raceId)
        {
            string raceType = this.raceTypes[raceId]; // 获取目标种族类型名

            JObject filtered = new JObject();

            foreach (JProperty element in this.attachData.Properties())
            {
                string elementId = element.Name;
                JObject elementData = (JObject)element.Value;
                if ((string)elementData["race"] == raceType)
                {
                    filtered.Add(elementId, elementData);
                }
            }

            return filtered;
        }

        public static byte[] getBytesFromFile(string fullFilePath)
        {
            byte[] bytes = null;

            FileStream fs = null;
            if (!File.Exists(fullFilePath)) {
                return bytes; // 文件未找到，直接返回null
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
                //Console.WriteLine(ex);
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

        public static string getIconPath(JObject elementData)
        {
            return BstManager.PATH_DATABASE + "icon/png-cps/" + (string)elementData["pic"];
        }

        public static string getItemPicPath(int itemType, string itemId)
        {
            string path = null;
            switch (itemType)
            {
                case BstManager.ITEM_TYPE_COSTUME:
                    path = BstManager.PATH_DATABASE + "costume/pics-cps/" + itemId + ".png";
                    break;
                case BstManager.ITEM_TYPE_ATTACH:
                    path = BstManager.PATH_DATABASE + "attach/pics-cps/" + itemId + ".png";
                    break;
                case BstManager.ITEM_TYPE_WEAPON:
                    path = BstManager.PATH_DATABASE + "weapon/pics-cps/" + itemId + ".png";
                    break;
                default:
                    break;
            }
            return path;
        }

        public static void runGrunt(TextBox box, string task = "", string[] args = null)
        {
            BackgroundWorker worker = new BackgroundWorker();
            worker.DoWork += (s, e) =>
            {
                Process proc = new Process();

                string cwd = Directory.GetCurrentDirectory() + "/" + BstManager.PATH_ROOT;
                string cmd = "cmd.exe";
                string arguments = "/c grunt " + task + " " + ((args == null) ? "" : String.Join(" ", args)) + " --stack";
                // 打印命令信息
                MethodInvoker logAction = delegate
                {
                    box.AppendText("开始运行：\r\n" + "位置：" + cwd + "\r\n" + "命令：" + cmd + "\r\n" + "参数：" + arguments + "\r\n输出：\r\n");
                };
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
                    MethodInvoker outputAction = delegate // cross thread update
                    {
                        box.AppendText(dataE.Data + "\r\n");
                    };
                    box.BeginInvoke(outputAction);
                };
                proc.Start(); // 启动
                proc.BeginOutputReadLine(); // 逐行读入输出
            };
            worker.RunWorkerCompleted += (s, e) =>
            {
                worker.Dispose();
            };
            worker.RunWorkerAsync();
        }

    }
}
