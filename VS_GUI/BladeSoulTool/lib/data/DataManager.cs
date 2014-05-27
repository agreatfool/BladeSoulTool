using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace BladeSoulTool
{
    class DataManager
    {
        private static DataManager instance;

        public static DataManager Instance 
        {
            get 
            {
                if (instance == null) 
                {
                    instance = new DataManager();
                }
                return instance;
            }
        }

        private DataManager()
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

        public const string PATH_ROOT = "../../../../";
        public const string PATH_CONFIG = DataManager.PATH_ROOT + "config/";
        public const string PATH_DATABASE = DataManager.PATH_ROOT + "database/";

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
            this.settings = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(DataManager.PATH_CONFIG + "setting.json")));
            this.costumeData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(DataManager.PATH_DATABASE + "costume/data/data.json")));
            this.costumeInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(DataManager.PATH_DATABASE + "costume/data/data_invalid.json")));
            this.attachData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(DataManager.PATH_DATABASE + "attach/data/data.json")));
            this.attachInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(DataManager.PATH_DATABASE + "attach/data/data_invalid.json")));
            this.weaponData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(DataManager.PATH_DATABASE + "weapon/data/data.json")));
            this.weaponInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(DataManager.PATH_DATABASE + "weapon/data/data_invalid.json")));

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

    }
}
