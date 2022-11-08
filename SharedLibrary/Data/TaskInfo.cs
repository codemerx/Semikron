using System.Text.Json.Serialization;

namespace SharedLibrary.Data
{
    public class TaskInfo
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Progress { get; set; }
        public string Priority { get; set; }
        public int Duration { get; set; }
        public bool Approved { get; set; }
        public int? ParentId { get; set; }
    }
}