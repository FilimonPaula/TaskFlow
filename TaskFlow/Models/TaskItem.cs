namespace TaskFlow.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    
    public string Status { get; set; } = "To Do";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    public int? UserId { get; set; }

    public User? User { get; set; }
}