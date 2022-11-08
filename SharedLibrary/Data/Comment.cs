namespace SharedLibrary.Data
{
    public class Comment : DbData
    {
        public int Id { get; set; }

        public int PostId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string Body { get; set; }


        public override object Clone()
        {
            return new Comment
            {
                Id = Id,
                Email = Email,
                Name = Name,
                PostId = PostId
            };
        }
    }
}