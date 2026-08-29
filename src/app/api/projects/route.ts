import { NextResponse } from 'next/server';
import { ProjectService } from '@/services/project.service';
import { z } from 'zod';

const createProjectSchema = z.object({
  organizationId: z.string().min(1, 'Organization slug or ID is required'),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  slug: z.string().min(2, 'Project slug is required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'archived']).optional(),
  visibility: z.enum(['private', 'organization']).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
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

    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    const result = await ProjectService.getProjects(orgIdOrSlug, {
      search,
      status,
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
    const parsed = createProjectSchema.parse(body);

    const project = await ProjectService.createProject(
      parsed.organizationId,
      parsed
    );

    return NextResponse.json({ success: true, data: project }, { status: 201 });
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
