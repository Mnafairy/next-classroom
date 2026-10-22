export function schoolFixture() {
  const student = (id: string, code: string, classId: string) => ({
    id,
    studentCode: code,
    displayName: "Student " + code,
    classId,
    schoolEmail: "excluded-student-email",
    gender: "excluded-gender",
    status: "ACTIVE",
  });
  const teacher = (
    name: string,
    classId: string,
    grade: number,
    students: unknown[],
  ) => ({
    id: "source-" + name,
    requestedUsername: name,
    firstName: name,
    lastName: "Teacher",
    email: name + "@oyunlag.edu.mn",
    department: { name: "excluded-department" },
    grades: [
      {
        grade,
        classes: [
          {
            id: classId,
            name: grade + "A",
            grade,
            courses: [{ description: "excluded-description", students }],
          },
        ],
      },
    ],
  });
  return {
    teachers: [
      teacher("alpha", "c1", 7, [student("s1", "001", "c1")]),
      teacher("beta", "c1", 7, [student("s1", "001", "c1")]),
      teacher("gamma", "c2", 8, [student("s2", "004", "c2")]),
    ],
  };
}
