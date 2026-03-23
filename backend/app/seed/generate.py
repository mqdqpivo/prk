import random
import sys
import os
from datetime import date, time, timedelta, datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from faker import Faker
from app.database import SessionLocal, engine, Base
from app.models import (
    User, UserRole, Specialty, EducationLevel, Group, Student, Teacher,
    ParentStudent, ParentRelation, Subject, TeacherSubjectGroup, ScheduleSlot,
    WeekType, Grade, GradeType, Attendance, AttendanceStatus, Assignment,
    AssignmentSubmission, SubmissionStatus, Announcement, TargetRole,
    ChatMessage, Notification, NotificationType
)
from app.dependencies import get_password_hash

fake = Faker('ru_RU')
random.seed(42)

SPECIALTIES = [
    ("09.02.06", "Сетевое и системное администрирование", "", "spo", "ССА", 3),
    ("09.02.09", "Веб-разработка", "", "spo", "ВР", 3),
    ("09.02.10", "Разработка компьютерных игр, VR/AR", "", "spo", "КИ", 3),
    ("09.02.11", "Разработка и управление ПО", "", "spo", "РПО", 3),
    ("09.02.12", "Техническая эксплуатация ИС", "", "spo", "ТЭИС", 3),
    ("09.02.13", "Интеграция решений с ИИ", "", "spo", "ИСиП", 3),
    ("10.02.05", "Информационная безопасность АС", "", "spo", "ИБ", 3),
    ("21.02.19", "Землеустройство", "", "spo", "ЗУ", 3),
    ("38.02.01", "Экономика и бухгалтерский учёт", "", "spo", "ЭиБУ", 3),
    ("38.02.03", "Операционная деятельность в логистике", "", "spo", "ОДЛ", 3),
    ("38.02.06", "Финансы", "", "spo", "ФИН", 3),
    ("38.02.07", "Банковское дело", "", "spo", "БД", 3),
    ("40.02.02", "Правоохранительная деятельность", "", "spo", "ПД", 3),
    ("40.02.04", "Юриспруденция", "", "spo", "ЮР", 3),
    ("42.02.01", "Реклама", "", "spo", "РЕК", 3),
    ("43.02.16", "Туризм и гостеприимство", "", "spo", "ТиГ", 3),
    ("43.02.17", "Технологии индустрии красоты", "", "spo", "ТИК", 3),
    ("44.02.02", "Преподавание в начальных классах", "", "spo", "ПНК", 3),
    ("44.02.05", "Коррекционная педагогика", "", "spo", "КП", 3),
    ("54.02.01", "Дизайн (по отраслям)", "", "spo", "ДИЗ", 3),
    ("54.02.08", "Техника и искусство фотографии", "", "spo", "ТИФ", 3),
    ("09.03.01", "Информатика и ВТ / Беспилотные системы", "", "bachelor", "ИВТ", 4),
    ("09.03.03", "Прикладная информатика", "", "bachelor", "ПрИ", 4),
    ("09.03.04", "Программная инженерия", "", "bachelor", "ПИ", 4),
    ("10.03.00", "Информационная безопасность", "", "bachelor", "ИБ", 4),
    ("21.03.02", "Землеустройство и кадастры", "", "bachelor", "ЗиК", 4),
    ("38.03.01", "Экономика", "", "bachelor", "ЭК", 4),
    ("38.03.02", "Менеджмент", "", "bachelor", "МЕН", 4),
    ("38.03.03", "Управление персоналом", "", "bachelor", "УП", 4),
    ("38.03.04", "ГМУ", "", "bachelor", "ГМУ", 4),
    ("40.03.01", "Юриспруденция", "", "bachelor", "ЮР", 4),
    ("41.03.01", "Зарубежное регионоведение / Китай", "", "bachelor", "ЗР", 4),
    ("42.03.01", "Реклама и PR", "", "bachelor", "РиПР", 4),
    ("43.03.02", "Туризм", "", "bachelor", "ТУР", 4),
    ("43.03.03", "Гостиничное дело", "", "bachelor", "ГД", 4),
    ("44.03.01", "Педагогическое образование", "", "bachelor", "ПО", 4),
    ("44.03.02", "Психолого-педагогическое образование", "", "bachelor", "ППО", 4),
    ("44.03.03", "Специальное образование", "", "bachelor", "СО", 4),
    ("45.03.04", "Интеллектуальные системы в гуманит.сфере", "", "bachelor", "ИСГ", 4),
    ("54.03.01", "Дизайн", "", "bachelor", "ДИЗ", 4),
    ("38.05.01", "Экономика и управление / Эконом.безопасность", "", "specialist", "ЭБ", 5),
    ("09.04.01", "Информатика и ВТ", "", "master", "ИВТ", 2),
    ("09.04.04", "Программная инженерия", "", "master", "ПИ", 2),
    ("38.04.01", "Экономика", "", "master", "ЭК", 2),
    ("38.04.02", "Менеджмент", "", "master", "МЕН", 2),
    ("38.04.03", "Управление персоналом", "", "master", "УП", 2),
    ("38.04.04", "ГМУ", "", "master", "ГМУ", 2),
    ("38.04.08", "Финансы и кредит", "", "master", "ФиК", 2),
    ("40.04.01", "Юриспруденция", "", "master", "ЮР", 2),
    ("44.04.02", "Психолого-педагогическое образование", "", "master", "ППО", 2),
]

LEVEL_MAP = {
    "spo": "СПО",
    "bachelor": "Б",
    "specialist": "С",
    "master": "М",
}

POSITIONS = [
    "Старший преподаватель", "Доцент", "Профессор", "Преподаватель",
    "Заведующий кафедрой", "Ассистент"
]

DEGREES = [
    "к.т.н.", "к.э.н.", "к.ю.н.", "к.п.н.", "д.т.н.", "д.э.н.",
    "к.ф.-м.н.", None, None, None
]

DEPARTMENTS = [
    "Кафедра информатики и ВТ",
    "Кафедра программной инженерии",
    "Кафедра экономики и финансов",
    "Кафедра юриспруденции",
    "Кафедра менеджмента",
    "Кафедра педагогики",
    "Кафедра дизайна",
    "Кафедра туризма и гостеприимства",
    "Кафедра гуманитарных дисциплин",
    "Кафедра математики",
]

SUBJECT_TEMPLATES = [
    "Математика", "Физика", "Информатика", "Программирование",
    "Базы данных", "Сети и телекоммуникации", "Операционные системы",
    "Экономика", "Менеджмент", "Маркетинг", "Бухгалтерский учёт",
    "Гражданское право", "Уголовное право", "Административное право",
    "Педагогика", "Психология", "Философия", "Иностранный язык",
    "Русский язык", "История", "Физическая культура",
    "Дискретная математика", "Теория вероятностей", "Алгоритмы и структуры данных",
    "Веб-технологии", "Мобильная разработка", "Искусственный интеллект",
    "Компьютерная графика", "Дизайн интерфейсов", "Типографика",
    "Туристическая деятельность", "Гостиничный бизнес",
]

ANNOUNCEMENT_CONTENTS = {
    "Расписание экзаменов": "Расписание зимней экзаменационной сессии опубликовано на сайте института. Просьба ознакомиться с датами и аудиториями проведения экзаменов. При возникновении вопросов обращайтесь в деканат.",
    "Изменения в расписании": "В связи с производственной необходимостью внесены изменения в расписание занятий на текущую неделю. Обновлённое расписание доступно в личном кабинете. Просьба проверить свои занятия.",
    "Стипендия": "Информируем о начале выплаты стипендии за текущий месяц. Студентам, имеющим задолженности по оплате, необходимо обратиться в бухгалтерию для уточнения сроков выплаты.",
    "День открытых дверей": "Приглашаем всех желающих на День открытых дверей ИМСИТ, который состоится в главном корпусе института. В программе: презентации специальностей, экскурсии по лабораториям и встречи с преподавателями.",
    "Конференция ИМСИТ": "Приглашаем студентов и преподавателей принять участие в ежегодной научно-практической конференции ИМСИТ. Тезисы докладов принимаются до конца текущего месяца на электронную почту оргкомитета.",
    "Перенос занятий": "В связи с проведением ремонтных работ в корпусе Б занятия переносятся в аудитории корпуса А. Актуальное расписание размещено на информационных стендах и в личном кабинете.",
    "Пересдача экзаменов": "Расписание пересдач экзаменов утверждено и опубликовано. Студенты, имеющие академические задолженности, должны записаться на пересдачу через деканат не позднее указанного срока.",
    "Требования к курсовым работам": "Напоминаем о требованиях к оформлению курсовых работ. Работы должны быть оформлены в соответствии с методическими указаниями кафедры. Срок сдачи — до конца семестра.",
    "Субботник": "Приглашаем студентов и сотрудников принять участие в субботнике на территории института. Сбор участников у главного входа. Форма одежды — рабочая.",
    "Каникулы": "Зимние каникулы продлятся с 30 декабря по 8 февраля. Занятия возобновляются согласно расписанию второго семестра. Желаем хорошего отдыха!",
    "Начало практики": "Информируем о начале производственной практики для студентов старших курсов. Необходимо получить направление на практику в деканате и заключить договор с предприятием.",
    "Документы в деканат": "Просьба в кратчайшие сроки предоставить в деканат недостающие документы. Список необходимых документов размещён на информационном стенде деканата.",
    "Повышение квалификации": "Для преподавателей доступны курсы повышения квалификации по актуальным направлениям. Запись осуществляется через учебно-методический отдел.",
    "Олимпиада по программированию": "Приглашаем студентов IT-специальностей принять участие в олимпиаде по программированию. Регистрация участников открыта. Победители получат дипломы и ценные призы.",
    "Выпускной вечер": "Торжественное вручение дипломов состоится в актовом зале института. Выпускникам необходимо подтвердить участие и получить пригласительные билеты в деканате.",
}

ASSIGNMENT_TITLES = [
    "Лабораторная работа", "Практическое задание", "Контрольная работа",
    "Реферат", "Домашнее задание", "Курсовой проект",
    "Самостоятельная работа", "Эссе", "Расчётно-графическая работа",
    "Индивидуальное задание", "Отчёт по практике"
]

ASSIGNMENT_DESCRIPTIONS = [
    "Выполнить задание согласно методическим указаниям. Оформить отчёт в соответствии с требованиями кафедры и загрузить в систему до указанного срока.",
    "Изучить теоретический материал по теме и выполнить практические упражнения. Результаты оформить в виде отчёта с выводами.",
    "Решить задачи по пройденной теме. Ответы должны содержать полное решение с пояснениями каждого шага.",
    "Подготовить письменную работу по указанной теме с использованием не менее пяти источников литературы. Объём — не менее 10 страниц.",
    "Разработать программное решение поставленной задачи. Приложить исходный код и скриншоты работающей программы.",
    "Провести анализ предметной области и представить результаты в виде структурированного отчёта с таблицами и диаграммами.",
    "Выполнить расчёты по заданным параметрам и оформить результаты в виде пояснительной записки с графиками.",
    "Составить конспект по указанным главам учебника. Выделить ключевые определения и формулы.",
]

LESSON_TIMES = [
    (time(8, 30), time(10, 0)),
    (time(10, 10), time(11, 40)),
    (time(12, 10), time(13, 40)),
    (time(13, 50), time(15, 20)),
    (time(15, 30), time(17, 0)),
    (time(17, 10), time(18, 40)),
    (time(18, 50), time(20, 20)),
    (time(20, 30), time(22, 0)),
]


def generate():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # === Специальности ===
        specialties = []
        for code, name, profile, level, short_code, duration in SPECIALTIES:
            sp = Specialty(
                code=code, name=name, profile=profile,
                level=EducationLevel(level), short_code=short_code,
                duration_years=duration
            )
            db.add(sp)
            specialties.append(sp)
        db.flush()
        print(f"  ✓ Создано специальностей: {len(specialties)}")

        # === Admin ===
        admin_user = User(
            email="admin@imsit.ru",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.admin,
            first_name="Админ",
            last_name="Системный",
            middle_name="Администраторович",
        )
        db.add(admin_user)
        db.flush()

        # === Преподаватели ===
        teacher_users = []
        teachers = []

        test_teacher_user = User(
            email="teacher@imsit.ru",
            hashed_password=get_password_hash("teacher123"),
            role=UserRole.teacher,
            first_name="Иван",
            last_name="Преподавателев",
            middle_name="Петрович",
            phone=fake.phone_number(),
        )
        db.add(test_teacher_user)
        db.flush()
        test_teacher = Teacher(
            user_id=test_teacher_user.id,
            position=random.choice(POSITIONS),
            degree=random.choice(DEGREES),
            department=random.choice(DEPARTMENTS),
        )
        db.add(test_teacher)
        teacher_users.append(test_teacher_user)
        teachers.append(test_teacher)

        for i in range(49):
            u = User(
                email=fake.unique.email(),
                hashed_password=get_password_hash("teacher123"),
                role=UserRole.teacher,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                middle_name=fake.middle_name(),
                phone=fake.phone_number(),
            )
            db.add(u)
            db.flush()
            t = Teacher(
                user_id=u.id,
                position=random.choice(POSITIONS),
                degree=random.choice(DEGREES),
                department=random.choice(DEPARTMENTS),
            )
            db.add(t)
            teacher_users.append(u)
            teachers.append(t)
        db.flush()
        print(f"  ✓ Создано преподавателей: {len(teachers)}")

        # === Группы ===
        groups = []
        years = [20, 21, 22, 23, 24]
        for sp in specialties:
            num_groups = random.randint(1, 2)
            for year in random.sample(years, min(2, len(years))):
                for gn in range(1, num_groups + 1):
                    level_label = LEVEL_MAP.get(sp.level.value, "")
                    group_name = f"{year:02d}-{level_label}-{sp.short_code}-{gn:02d}"
                    curator = random.choice(teacher_users)
                    group = Group(
                        name=group_name,
                        specialty_id=sp.id,
                        year_start=2000 + year,
                        curator_id=curator.id,
                    )
                    db.add(group)
                    groups.append(group)
        db.flush()
        print(f"  ✓ Создано групп: {len(groups)}")

        # === Предметы ===
        subjects = []
        for sp in specialties:
            num_subjects = random.randint(6, 8)
            chosen = random.sample(SUBJECT_TEMPLATES, min(num_subjects, len(SUBJECT_TEMPLATES)))
            for idx, subj_name in enumerate(chosen):
                semester = (idx % 8) + 1
                hours_total = random.choice([72, 108, 144, 180])
                hours_lec = hours_total // 3
                hours_prac = hours_total - hours_lec
                subj = Subject(
                    name=subj_name,
                    short_name=subj_name[:20],
                    specialty_id=sp.id,
                    semester=semester,
                    hours_total=hours_total,
                    hours_lectures=hours_lec,
                    hours_practice=hours_prac,
                )
                db.add(subj)
                subjects.append(subj)
        db.flush()

        # === Студенты ===
        student_users = []
        students_list = []

        test_student_user = User(
            email="student@imsit.ru",
            hashed_password=get_password_hash("student123"),
            role=UserRole.student,
            first_name="Пётр",
            last_name="Студентов",
            middle_name="Сергеевич",
            phone=fake.phone_number(),
        )
        db.add(test_student_user)
        db.flush()
        first_group = groups[0] if groups else None
        test_student = Student(
            user_id=test_student_user.id,
            group_id=first_group.id if first_group else None,
            student_number=f"СБ-{random.randint(100000, 999999)}",
            birth_date=fake.date_of_birth(minimum_age=17, maximum_age=25),
            enrollment_date=date(2022, 9, 1),
        )
        db.add(test_student)
        student_users.append(test_student_user)
        students_list.append(test_student)

        for i in range(499):
            u = User(
                email=fake.unique.email(),
                hashed_password=get_password_hash("student123"),
                role=UserRole.student,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                middle_name=fake.middle_name(),
                phone=fake.phone_number(),
            )
            db.add(u)
            db.flush()
            group = random.choice(groups)
            s = Student(
                user_id=u.id,
                group_id=group.id,
                student_number=f"СБ-{100000 + i + 1}",
                birth_date=fake.date_of_birth(minimum_age=17, maximum_age=25),
                enrollment_date=date(group.year_start, 9, 1),
            )
            db.add(s)
            student_users.append(u)
            students_list.append(s)
        db.flush()
        print(f"  ✓ Создано студентов: {len(students_list)}")

        # === Родители ===
        test_parent_user = User(
            email="parent@imsit.ru",
            hashed_password=get_password_hash("parent123"),
            role=UserRole.parent,
            first_name="Мария",
            last_name="Студентова",
            middle_name="Ивановна",
            phone=fake.phone_number(),
        )
        db.add(test_parent_user)
        db.flush()
        ps_link = ParentStudent(
            parent_id=test_parent_user.id,
            student_id=test_student.id,
            relation=ParentRelation.mother,
        )
        db.add(ps_link)

        parent_count = 1
        students_with_parents = random.sample(students_list[1:], min(149, len(students_list) - 1))
        for student in students_with_parents:
            pu = User(
                email=fake.unique.email(),
                hashed_password=get_password_hash("parent123"),
                role=UserRole.parent,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                middle_name=fake.middle_name(),
                phone=fake.phone_number(),
            )
            db.add(pu)
            db.flush()
            link = ParentStudent(
                parent_id=pu.id,
                student_id=student.id,
                relation=random.choice(list(ParentRelation)),
            )
            db.add(link)
            parent_count += 1
        db.flush()
        print(f"  ✓ Создано родителей: {parent_count}")

        # === Teacher-Subject-Group связи ===
        tsgs = []
        group_subjects = {}
        for sp in specialties:
            sp_subjects = [s for s in subjects if s.specialty_id == sp.id]
            sp_groups = [g for g in groups if g.specialty_id == sp.id]
            for grp in sp_groups:
                group_subjects[grp.id] = []
                for subj in sp_subjects:
                    teacher = random.choice(teachers)
                    tsg = TeacherSubjectGroup(
                        teacher_id=teacher.id,
                        subject_id=subj.id,
                        group_id=grp.id,
                        academic_year="2024-2025",
                        semester=subj.semester,
                    )
                    db.add(tsg)
                    tsgs.append(tsg)
                    group_subjects[grp.id].append(subj)
        db.flush()

        # === Расписание ===
        rooms = [f"{random.randint(1, 5)}{random.randint(1, 20):02d}" for _ in range(40)]
        schedule_slots = []
        for tsg in tsgs:
            num_slots = random.randint(1, 2)
            for _ in range(num_slots):
                day = random.randint(1, 6)
                lesson_num = random.randint(1, 6)
                start_t, end_t = LESSON_TIMES[lesson_num - 1]
                slot = ScheduleSlot(
                    tsg_id=tsg.id,
                    day_of_week=day,
                    lesson_number=lesson_num,
                    room=random.choice(rooms),
                    week_type=WeekType.all,
                    start_time=start_t,
                    end_time=end_t,
                )
                db.add(slot)
                schedule_slots.append(slot)
        db.flush()

        # === Оценки ===
        grade_count = 0
        for student in students_list:
            group_subjs = group_subjects.get(student.group_id, [])
            for subj in group_subjs:
                tsg_match = [t for t in tsgs if t.subject_id == subj.id and t.group_id == student.group_id]
                teacher_id = tsg_match[0].teacher_id if tsg_match else teachers[0].id
                num_grades = random.randint(5, 15)
                for _ in range(num_grades):
                    value = max(2, min(5, round(random.gauss(3.8, 0.8))))
                    g = Grade(
                        student_id=student.id,
                        subject_id=subj.id,
                        teacher_id=teacher_id,
                        grade_type=random.choice(list(GradeType)),
                        value=value,
                        grade_date=fake.date_between(start_date='-6m', end_date='today'),
                        comment=random.choice([None, "Хорошая работа", "Нужно доработать", "Отлично", ""]),
                    )
                    db.add(g)
                    grade_count += 1
        db.flush()

        # === Посещаемость ===
        att_count = 0
        for slot in schedule_slots[:500]:
            tsg_obj = None
            for t in tsgs:
                if t.id == slot.tsg_id:
                    tsg_obj = t
                    break
            if not tsg_obj:
                continue
            group_students = [s for s in students_list if s.group_id == tsg_obj.group_id]
            for _ in range(random.randint(3, 8)):
                lesson_date = fake.date_between(start_date='-3m', end_date='today')
                for st in group_students:
                    status = random.choices(
                        [AttendanceStatus.present, AttendanceStatus.absent,
                         AttendanceStatus.late, AttendanceStatus.excused],
                        weights=[85, 8, 4, 3]
                    )[0]
                    att = Attendance(
                        student_id=st.id,
                        schedule_slot_id=slot.id,
                        lesson_date=lesson_date,
                        status=status,
                        marked_by=admin_user.id,
                    )
                    db.add(att)
                    att_count += 1
                if att_count > 20000:
                    break
            if att_count > 20000:
                break
        db.flush()

        # === Задания ===
        assignment_count = 0
        for tsg in tsgs[:200]:
            num_assignments = random.randint(3, 5)
            grp_students = [s for s in students_list if s.group_id == tsg.group_id]
            for a_idx in range(num_assignments):
                a_title = random.choice(ASSIGNMENT_TITLES)
                asgn = Assignment(
                    tsg_id=tsg.id,
                    title=f"{a_title} №{a_idx + 1}",
                    description=random.choice(ASSIGNMENT_DESCRIPTIONS),
                    due_date=fake.date_time_between(start_date='-1m', end_date='+1m'),
                    max_score=100,
                )
                db.add(asgn)
                db.flush()

                for st in grp_students:
                    status = random.choice(list(SubmissionStatus))
                    sub = AssignmentSubmission(
                        assignment_id=asgn.id,
                        student_id=st.id,
                        content="Работа выполнена и загружена в систему." if status != SubmissionStatus.pending else None,
                        score=random.randint(50, 100) if status == SubmissionStatus.checked else None,
                        feedback="Проверено" if status == SubmissionStatus.checked else None,
                        submitted_at=fake.date_time_between(start_date='-1m', end_date='now') if status != SubmissionStatus.pending else None,
                        checked_at=fake.date_time_between(start_date='-1m', end_date='now') if status == SubmissionStatus.checked else None,
                        status=status,
                    )
                    db.add(sub)
                assignment_count += 1
        db.flush()

        # === Объявления ===
        announcement_titles = [
            "Расписание экзаменов", "Изменения в расписании", "Стипендия",
            "День открытых дверей", "Конференция ИМСИТ", "Перенос занятий",
            "Пересдача экзаменов", "Требования к курсовым работам",
            "Субботник", "Каникулы", "Начало практики",
            "Документы в деканат", "Повышение квалификации",
            "Олимпиада по программированию", "Выпускной вечер"
        ]
        for title in announcement_titles:
            target = random.choice(list(TargetRole))
            target_group = random.choice(groups) if random.random() < 0.3 else None
            content_text = ANNOUNCEMENT_CONTENTS.get(title, "Подробная информация доступна в деканате института.")
            ann = Announcement(
                author_id=random.choice([admin_user.id] + [t.user_id for t in teachers[:5]]),
                title=title,
                content=content_text,
                target_role=target,
                target_group_id=target_group.id if target_group else None,
                is_pinned=random.random() < 0.2,
            )
            db.add(ann)
        db.flush()

        db.commit()

        print(f"\n  Тестовые аккаунты:")
        print(f"    admin@imsit.ru    / admin123")
        print(f"    student@imsit.ru  / student123")
        print(f"    parent@imsit.ru   / parent123")
        print(f"    teacher@imsit.ru  / teacher123")
        print(f"\n  ✓ Seed завершён успешно!")

    except Exception as e:
        db.rollback()
        print(f"  ✗ Ошибка: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    generate()
