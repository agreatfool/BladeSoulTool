using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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

        private void init()
        {
            this.settings = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../config/setting.json")));
            this.costumeData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/costume/data/data.json")));
            this.costumeInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/costume/data/data_invalid.json"))); 
            this.attachData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/attach/data/data.json")));
            this.attachInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/attach/data/data_invalid.json")));
            this.weaponData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/weapon/data/data.json")));
            this.weaponInvalidData = (JObject)JToken.ReadFrom(new JsonTextReader(File.OpenText(@"../../../../database/weapon/data/data_invalid.json")));
        }

    }
}
