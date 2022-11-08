namespace SharedLibrary.Data
{
    public abstract class Database
    {
        private bool loaded;

        private DbModel data;

        protected abstract Task<DbModel> ReadData();

        public async Task<DbModel> GetData()
        {
            await Load();
            return data;
        }

        private async Task Load()
        {
            if (loaded) return;

            data = await ReadData();
            data.TaskInfo = GetTree(150);
            loaded = true;
        }

        public List<T> Repeat<T>(int count, ICollection<T> dataToRepeat) where T : DbData
        {
            var total = dataToRepeat.Count * count;
            var res = new List<T>(total);

            for (int i = 0; i < total;)
            {
                foreach (var item in dataToRepeat)
                {
                    var clone = (T)item.Clone();
                    clone.RowNumber = ++i;

                    res.Add(clone);
                }
            }

            return res;
        }

        public List<TaskInfo> GetTree(int count = 60)
        {
            List<TaskInfo> tree = new List<TaskInfo>();
            
            int root = -1;
            int TaskNameID = 0;
            int ChildCount = -1;
            int SubTaskCount = -1;
            
            for (var t = 1; t <= count; t++)
            {
                Random gen = new Random();
                Random ran = new Random();
                DateTime start = new DateTime(2021, 06, 07);
                int range = (DateTime.Today - start).Days;
                DateTime startingDate = start.AddDays(gen.Next(range));
                DateTime end = new DateTime(2023, 08, 25);
                int endrange = (end - DateTime.Today).Days;
                DateTime endingDate = end.AddDays(gen.Next(endrange));
                string math = (ran.Next() % 3) == 0 ? "High" : (ran.Next() % 2) == 0 ? "Low" : "Critical";
                string progr = (ran.Next() % 3) == 0 ? "Started" : (ran.Next() % 2) == 0 ? "Open" : "In Progress";
                bool appr = (ran.Next() % 3) == 0 ? true : (ran.Next() % 2) == 0 ? false : true;
                root++; TaskNameID++;
                int rootItem = root + 1;
                tree.Add(new TaskInfo() { TaskId = rootItem, TaskName = "Parent task " + TaskNameID.ToString(), StartDate = startingDate, EndDate = endingDate, ParentId = null, Progress = progr, Priority = math, Duration = ran.Next(1, 50), Approved = appr });
                int parent = tree.Count;
                for (var c = 0; c < 2; c++)
                {
                    DateTime start1 = new DateTime(2021, 07, 09);
                    int range1 = (DateTime.Today - start1).Days;
                    DateTime startingDate1 = start1.AddDays(gen.Next(range1));
                    DateTime end1 = new DateTime(2025, 08, 23);
                    int endrange1 = (end1 - DateTime.Today).Days;
                    DateTime endingDate1 = end1.AddDays(gen.Next(endrange1));
                    root++; ChildCount++;
                    string val = ((parent + c + 1) % 3 == 0) ? "Low" : "Critical";
                    int parn = parent + c + 1;
                    progr = (ran.Next() % 3) == 0 ? "In Progress" : (ran.Next() % 2) == 0 ? "Open" : "Validated";
                    appr = (ran.Next() % 3) == 0 ? true : (ran.Next() % 2) == 0 ? false : true;
                    int iD = root + 1;
                    tree.Add(new TaskInfo() { TaskId = iD, TaskName = "Child task " + (ChildCount + 1).ToString(), StartDate = startingDate1, EndDate = endingDate1, ParentId = rootItem, Progress = progr, Priority = val, Duration = ran.Next(1, 50), Approved = appr });
                    if ((((parent + c + 1) % 3) == 0))
                    {
                        int immParent = tree.Count;
                        for (var s = 0; s < 3; s++)
                        {
                            DateTime start2 = new DateTime(2021, 05, 05);
                            int range2 = (DateTime.Today - start2).Days;
                            DateTime startingDate2 = start2.AddDays(gen.Next(range2));
                            DateTime end2 = new DateTime(2024, 06, 16);
                            int endrange2 = (end2 - DateTime.Today).Days;
                            DateTime endingDate2 = end2.AddDays(gen.Next(endrange2));
                            root++; SubTaskCount++;
                            string Prior = (immParent % 2 == 0) ? "Validated" : "Normal";
                            tree.Add(new TaskInfo() { TaskId = root + 1, TaskName = "Sub task " + (SubTaskCount + 1).ToString(), StartDate = startingDate2, EndDate = endingDate2, ParentId = iD, Progress = (immParent % 2 == 0) ? "In Progress" : "Closed", Priority = Prior, Duration = ran.Next(1, 50), Approved = appr });
                        }
                    }
                }
            }
            return tree;
        }
    }
}