import { NextResponse } from 'next/server';
import { TaskService } from '@/services/task.service';
import { z } from 'zod';

const createTaskSchema = z.object({
  organizationId: z.string().min(1, 'Organization slug or ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  labelIds: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgIdOrSlug = searchParams.get('org') || searchParams.get('organizationId');

    if (!orgIdOrSlug) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Organization slug or ID query param is required.' } },
        { status: 400 }
      );
    }

    const projectId = searchParams.get('projectId') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    const result = await TaskService.getTasks(orgIdOrSlug, {
      projectId,
      status,
      priority,
      search,
      page,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: err.message } },
      { status: 403 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.parse(body);

    const task = await TaskService.createTask(parsed.organizationId, parsed);

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: err.message } },
      { status: 400 }
    );
  }
}
