using System;
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
            this._i18n = BstManager.Instance.DataI18N;
        }

        public string LoadI18NValue(string uiClassName, string key)
        {
            try
            {
                return (string) this._i18n[uiClassName][key];
            }
            catch (Exception ex)
            {
                BstLogger.Instance.Log(ex.ToString());
                return null;
            }
        }

    }
}
