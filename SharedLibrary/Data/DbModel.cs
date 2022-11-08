namespace SharedLibrary.Data
{
    public class DbModel{

        public List<Comment> Comments { get; set; } = new List<Comment>();
        public List<Post> Posts { get; set; } = new List<Post>();
    }
}