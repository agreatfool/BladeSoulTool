using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Diagnostics;
using System.Windows.Forms;
using System.Threading;

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
            FileStream fs = null;
            try
            {
                fs = File.OpenRead(fullFilePath);
                byte[] bytes = new byte[fs.Length];
                fs.Read(bytes, 0, Convert.ToInt32(fs.Length));
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
            Process proc = new Process();

            proc.StartInfo.WorkingDirectory = Directory.GetCurrentDirectory() + "/" + BstManager.PATH_ROOT;
            proc.StartInfo.FileName = "cmd.exe";
            proc.StartInfo.Arguments = "/c grunt " + task + " " + ((args == null) ? "" : String.Join(" ", args)) + " --stack";
            proc.StartInfo.UseShellExecute = false;
            proc.StartInfo.CreateNoWindow = true;
            proc.StartInfo.RedirectStandardError = true;
            proc.StartInfo.RedirectStandardOutput = true;

            proc.OutputDataReceived += (s, e) =>
            {
                // 注册输出接收事件
                MethodInvoker action = delegate // cross thread update
                {
                    box.AppendText(e.Data + "\r\n");
                };
                box.BeginInvoke(action);
            };
            proc.Start(); // 启动
            proc.BeginOutputReadLine(); // 逐行读入输出

            while (!proc.HasExited)
            {
                Application.DoEvents(); // This keeps your form responsive by processing events
            }
        }

    }
}
