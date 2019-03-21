import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from subprocess import call
import sys


class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        print(f'event type: {event.event_type}  path : {event.src_path}')
        call([sys.argv[1], sys.argv[2], event.src_path])


if __name__ == "__main__":
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, path=sys.argv[3], recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
