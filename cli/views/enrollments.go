package views

import (
	"fmt"
	"os"
	"sort"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/api"
	"github.com/wolfy/code/fullstack/canvasInstructor/cli/logger"
)

type EnrollmentsView struct {
	enrollments []api.Enrollment
	selected    int
	err         error
}

func NewEnrollmentView() *EnrollmentsView {
	log := logger.With("component", "enrollment_view")
	log.Info("Creating new enrollment view")
	return &EnrollmentsView{
		enrollments: []api.Enrollment{},
		selected:    0,
	}
}

func (v *EnrollmentsView) Init() tea.Cmd {
	log := logger.With("component", "enrollments_view")
	log.Info("Initializing enrollments view")
	return v.fetchEnrollments
}

func (v *EnrollmentsView) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	log := logger.With("component", "enrollments_view")

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "k":
			if v.selected > 0 {
				v.selected--
			}
		case "down", "j":
			if v.selected < len(v.enrollments)-1 {
				v.selected++
			}
		case "enter":
			if len(v.enrollments) > 0 {
				selectedEnrollment := v.enrollments[v.selected]
				log.Info("Selected enrollment",
					"student_name", selectedEnrollment.User.Name,
					"enrollment_type", selectedEnrollment.Type)
				return v, func() tea.Msg {
					return EnrollmentSelectedMsg{
						Enrollment: selectedEnrollment,
					}
				}
			}
		case "esc":
			log.Info("Returning to home view")
			return v, func() tea.Msg {
				return HomeView{}
			}
		case "q", "ctrl+c":
			return v, tea.Quit
		}
	case enrollmentsMsg:
		log.Info("Received enrollments", "count", len(msg))
		v.enrollments = msg
	case errMsg:
		log.Error("Error occurred", "error", msg)
		v.err = msg
	}

	return v, nil
}

func (v *EnrollmentsView) View() string {
	var passingScore = 70.0

	if v.err != nil {
		return fmt.Sprintf("Error: %v\n\nPress esc to go back, q to quit.", v.err)
	}

	if len(v.enrollments) == 0 {
		return "Loading enrollments...\n\nPress esc to go back, q to quit."
	}

	s := fmt.Sprintf("Course Enrollments (%d students)\n\n", len(v.enrollments))

	// Create table header
	s += v.formatTableHeader()
	s += v.formatTableSeparator()

	// Add enrollment rows
	sort.Slice(v.enrollments, func(i, j int) bool {
		return v.enrollments[i].Grades.Score < v.enrollments[j].Grades.Score
	})

	failing, passing := partition(v.enrollments, func(e api.Enrollment) float64 { return float64(e.Grades.Score) }, passingScore)

	// loop failing
	for i, enrollment := range failing {
		cursor := " "
		if v.selected == i {
			cursor = ">"
		}
		s += v.formatEnrollmentRow(cursor, enrollment)
	}

	// display partition
	s += v.formatPartition()

	// loop passing
	offset := len(failing)
	for i, enrollment := range passing {
		cursor := " "
		if v.selected == i+offset {
			cursor = ">"
		}
		s += v.formatEnrollmentRow(cursor, enrollment)
	}

	s += "\n" + v.formatTableSeparator()
	s += "\nNavigation: ↑/k (up), ↓/j (down), Enter (select), Esc (back), q (quit)"

	return s
}

func (v *EnrollmentsView) formatTableHeader() string {
	return fmt.Sprintf("  %-30s %-15s %-12s %-12s %-10s\n",
		"Student Name", "Type", "State", "Current Grade", "Final Grade")
}

func (v *EnrollmentsView) formatTableSeparator() string {
	return strings.Repeat("─", 85) + "\n"
}

func (v *EnrollmentsView) formatPartition() string {
	return strings.Repeat("~", 38) + " PASSING " + strings.Repeat("~", 38) + "\n"
}

func (v *EnrollmentsView) formatEnrollmentRow(cursor string, enrollment api.Enrollment) string {
	// Truncate name if too long
	name := enrollment.User.Name
	if len(name) > 28 {
		name = name[:25] + "..."
	}

	// Format enrollment type (remove "Enrollment" suffix for brevity)
	enrollmentType := strings.TrimSuffix(enrollment.Type, "Enrollment")

	// Format grades
	currentGrade := fmt.Sprintf("%.1f%%", enrollment.Grades.Score)

	// Format state with color indicators (using simple text for CLI)
	state := enrollment.State
	switch state {
	case "active":
		state = "✓ Active"
	case "inactive":
		state = "✗ Inactive"
	case "invited":
		state = "? Invited"
	case "completed":
		state = "✓ Complete"
	}

	return fmt.Sprintf("%s %-30s %-15s %-12s %-10s\n", cursor, name, enrollmentType, state, currentGrade)
}

func (v *EnrollmentsView) fetchEnrollments() tea.Msg {
	log := logger.With(
		"component", "enrollments_view",
		"action", "fetch_enrollments",
	)
	log.Info("Fetching enrollments")

	port := os.Getenv("PORT")
	client := api.NewClient(fmt.Sprintf("http://localhost:%s", port))

	// Fetch enrollments for the specific course
	// Assuming your API client has a method like GetCourseEnrollments
	enrollments, err := client.GetCourseEnrollments()
	if err != nil {
		log.Error("Failed to fetch enrollments", "error", err)
		return errMsg(err)
	}

	// Filter to only student enrollments if needed
	var studentEnrollments []api.Enrollment
	for _, enrollment := range enrollments {
		if enrollment.Type == "StudentEnrollment" {
			studentEnrollments = append(studentEnrollments, enrollment)
		}
	}

	log.Info("Successfully fetched enrollments", "total_count", len(enrollments), "student_count", len(studentEnrollments))
	return enrollmentsMsg(studentEnrollments)
}

func partition[T any](slice []T, getValue func(T) float64, threshold float64) ([]T, []T) {
	var lower, higher []T
	for _, item := range slice {
		if getValue(item) < threshold {
			lower = append(lower, item)
		} else {
			higher = append(higher, item)
		}
	}
	return lower, higher
}

// Message types
type enrollmentsMsg []api.Enrollment

type EnrollmentSelectedMsg struct {
	Enrollment api.Enrollment
}
