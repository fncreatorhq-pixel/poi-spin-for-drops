// Anonymous Twitch IRC chat reader over WebSocket.
// No auth required for reading public chat.

export type ChatMessageHandler = (username: string, message: string) => void;

export class TwitchChatClient {
  private ws: WebSocket | null = null;
  private channel: string;
  private onMessage: ChatMessageHandler;
  private onStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  private closedByUser = false;

  constructor(
    channel: string,
    onMessage: ChatMessageHandler,
    onStatus: (s: 'connecting' | 'connected' | 'disconnected' | 'error') => void,
  ) {
    this.channel = channel.toLowerCase().replace(/^#/, '').trim();
    this.onMessage = onMessage;
    this.onStatus = onStatus;
  }

  connect() {
    this.closedByUser = false;
    this.onStatus('connecting');
    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    this.ws = ws;

    ws.onopen = () => {
      const nick = 'justinfan' + Math.floor(Math.random() * 100000);
      ws.send('CAP REQ :twitch.tv/tags');
      ws.send(`NICK ${nick}`);
      ws.send(`JOIN #${this.channel}`);
      this.onStatus('connected');
    };

    ws.onmessage = (event) => {
      const raw = event.data as string;
      // Twitch may batch multiple IRC lines
      raw.split('\r\n').forEach((line) => {
        if (!line) return;
        if (line.startsWith('PING')) {
          ws.send('PONG :tmi.twitch.tv');
          return;
        }
        // Parse PRIVMSG lines. Format: [@tags] :user!user@user.tmi.twitch.tv PRIVMSG #channel :message
        const privmsgIdx = line.indexOf(' PRIVMSG ');
        if (privmsgIdx === -1) return;
        const prefixPart = line.substring(0, privmsgIdx);
        const rest = line.substring(privmsgIdx + ' PRIVMSG '.length);
        const colonIdx = rest.indexOf(' :');
        if (colonIdx === -1) return;
        const message = rest.substring(colonIdx + 2);
        // extract username from prefixPart: last ':' segment
        const lastColon = prefixPart.lastIndexOf(':');
        const userPart = prefixPart.substring(lastColon + 1);
        const bang = userPart.indexOf('!');
        const username = bang > -1 ? userPart.substring(0, bang) : userPart;
        this.onMessage(username, message);
      });
    };

    ws.onerror = () => {
      this.onStatus('error');
    };

    ws.onclose = () => {
      this.onStatus('disconnected');
      if (!this.closedByUser) {
        // auto-reconnect after 2s
        setTimeout(() => this.connect(), 2000);
      }
    };
  }

  disconnect() {
    this.closedByUser = true;
    this.ws?.close();
    this.ws = null;
  }
}
