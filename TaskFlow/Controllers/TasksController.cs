using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TaskFlow.Data;
using TaskFlow.Models;

namespace TaskFlow.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        return int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskItem>>> GetTasks()
    {
        var userId = GetUserId();

        return await _context.Tasks
            .Where(task => task.UserId == userId)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTasks(TaskItem task)
    {
        task.UserId = GetUserId();

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTasks),
            new { id = task.Id },
            task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(
        int id,
        TaskItem updatedTask)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(
                t => t.Id == id &&
                     t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.Status = updatedTask.Status;
        task.DueDate = updatedTask.DueDate;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(
                t => t.Id == id &&
                     t.UserId == userId);

        if (task == null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}