using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool
{
    class DataManager
    {
        private static DataManager instance;

        public static DataManager Instance {
            get {
                if (instance == null) {
                    instance = new DataManager();
                }
                return instance;
            }
        }

        private DataManager() { }

        public JObject settings { get; set; }
        public JObject costumeData { get; set; }
        public JObject costumeInvalidData { get; set; }
        public JObject attachData { get; set; }
        public JObject attachInvalidData { get; set; }
        public JObject weaponData { get; set; }
        public JObject weaponInvalidData { get; set; }

    }
}
