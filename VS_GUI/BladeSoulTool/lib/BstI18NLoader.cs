using Newtonsoft.Json.Linq;

namespace BladeSoulTool.lib
{
    class BstI18NLoader
    {
        private static BstI18NLoader _instance;

        public static BstI18NLoader Instance 
        {
            get 
            {
                if (_instance == null)
                {
                    _instance = new BstI18NLoader();
                }
                return _instance;
            }
        }

        private JObject _i18n;

        private BstI18NLoader()
        {
            var lang = (string) BstManager.Instance.SystemSettings["lang"];
            this._i18n = BstManager.ReadJsonFile(BstManager.PathI18N + lang + ".json");
        }

        public string LoadI18NValue(string uiClassName, string key)
        {
            return (string) this._i18n[uiClassName][key];
        }

    }
}
