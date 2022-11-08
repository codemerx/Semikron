namespace SharedLibrary.Data
{
    public class Post : DbData
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }

        public override object Clone()
        {
            return new Post
            {
                Id = Id,
                UserId = UserId,
                Title = Title,
            };
        }
    }
}