package logger

import (
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"time"
)

// Logger is the global logger instance
var Logger *slog.Logger

func init() {
	// Create logs directory if it doesn't exist
	logsDir := filepath.Join("logs")
	if err := os.MkdirAll(logsDir, 0755); err != nil {
		panic("failed to create logs directory: " + err.Error())
	}

	// Create log file with timestamp
	logFile := filepath.Join(logsDir, time.Now().Format("2006-01-02")+".log")
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		panic("failed to open log file: " + err.Error())
	}

	// Create a multi-writer that writes to both stdout and the log file
	multiWriter := io.MultiWriter(file)

	// Create a handler that writes to both stdout and file with a custom format
	handler := slog.NewTextHandler(multiWriter, &slog.HandlerOptions{
		Level: slog.LevelInfo,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			// Customize timestamp format
			if a.Key == slog.TimeKey {
				return slog.Attr{
					Key:   slog.TimeKey,
					Value: slog.StringValue(time.Now().Format("2006-01-02 15:04:05")),
				}
			}
			return a
		},
	})

	Logger = slog.New(handler)
}

// With returns a new logger with the given attributes
func With(args ...any) *slog.Logger {
	return Logger.With(args...)
}
