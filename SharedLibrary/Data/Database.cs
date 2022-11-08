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

    }
}