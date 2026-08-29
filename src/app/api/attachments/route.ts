import { NextResponse } from 'next/server';
import { AttachmentService } from '@/services/attachment.service';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const orgIdOrSlug = formData.get('organizationId') as string | null;
    const taskId = formData.get('taskId') as string | null;

    if (!file || !orgIdOrSlug || !taskId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing required file, organizationId, or taskId.' } },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const attachment = await AttachmentService.uploadAttachment(
      orgIdOrSlug,
      taskId,
      buffer,
      file.name,
      file.type || 'application/octet-stream'
    );

    return NextResponse.json({ success: true, data: attachment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: err.message } },
      { status: 400 }
    );
  }
}
