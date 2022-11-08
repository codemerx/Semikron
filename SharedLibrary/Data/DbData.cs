namespace SharedLibrary.Data
{
    public abstract class DbData : ICloneable
    {
        public int RowNumber { get; set; }

        public abstract object Clone();
    }
}