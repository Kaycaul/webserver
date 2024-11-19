#!/bin/sh

# default session name, personal preference
DEFAULT_SESSION="main"

if [ -z "$TMUX" ]; then
    # open a session with the default name if it doesnt exist
    SESSION=$DEFAULT_SESSION
    tmux new-session -d -s $SESSION
else
    # get the name of the current session
    SESSION=$(tmux display-message -p '#S')
fi

# run the webserver detached
docker compose up -d

# set up session and clear window
tmux kill-window -t $SESSION:webserver
tmux new-window -t $SESSION -n webserver

# attach to express, mongo, cloudflared, open mongosh, bash
tmux split-window -h -t $SESSION:webserver
tmux split-window -v -l 80% -t $SESSION:webserver.1 
tmux split-window -v -l 35% -t $SESSION:webserver.0 
tmux split-window -h -t $SESSION:webserver.2
tmux send-keys -t $SESSION:webserver.0 "docker attach webserver" C-m
tmux send-keys -t $SESSION:webserver.1 "mongosh" C-m
tmux send-keys -t $SESSION:webserver.1 "use website" C-m
tmux send-keys -t $SESSION:webserver.2 "docker attach mongoserver" C-m
tmux send-keys -t $SESSION:webserver.3 "docker attach cloudflared" C-m
tmux select-pane -t $SESSION:webserver.4

# attach to session if not already in tmux
if [ -z "$TMUX" ]; then
    tmux attach -t $SESSION
fi