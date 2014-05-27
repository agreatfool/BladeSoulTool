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
            this.settings = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../config/setting.json")));
            this.costumeData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/costume/data/data.json")));
            this.costumeInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/costume/data/data_invalid.json"))); 
            this.attachData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/attach/data/data.json")));
            this.attachInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/attach/data/data_invalid.json")));
            this.weaponData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/weapon/data/data.json")));
            this.weaponInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/weapon/data/data_invalid.json")));

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
            Console.WriteLine(filtered.ToString());

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
            Console.WriteLine(filtered.ToString());

            return filtered;
        }

    }
}
