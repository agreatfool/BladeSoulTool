using System.Data;
using System.Windows.Forms;
using Newtonsoft.Json.Linq;

namespace BladeSoulTool.lib
{
    class BstIconLoadTask
    {
        public JObject ElementData { get; set; } // JObject element data
        public DataGridView Grid; // DataGridView contains the DataTable
        public DataTable Table; // DataTable contains the pic
        public int RowId { get; set; } // DataTable line to be updated
        public TextBox Box { get; set; } // TextBox to write message
        public int ColId { get; set; } // DataTable column to be updated

        public BstIconLoadTask(JObject elementData, DataGridView grid, DataTable table, int rowId = 0, TextBox box = null, int colId = 0)
        {
            this.ElementData = elementData;
            this.Grid = grid;
            this.Table = table;
            this.RowId = rowId;
            this.Box = box;
            this.ColId = colId;
        }
    }
}
