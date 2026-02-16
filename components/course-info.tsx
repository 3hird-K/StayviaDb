"use client";

import { Label } from "@/components/ui/label";

export function CourseInfo({ course_id }: { course_id: string | null }) {
  if (!course_id) {
    return (
      <div>
        <Label className="mb-1 text-muted-foreground">Course</Label>
        <p className="font-medium text-muted-foreground">N/A</p>
      </div>
    );
  }

  return (
    <div>
      <Label className="mb-1 text-muted-foreground">Course</Label>
      <p className="font-medium">{course_id}</p>
    </div>
  );
}
