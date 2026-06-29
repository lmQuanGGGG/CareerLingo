'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Search, Send, ArrowLeft, Loader2, Bookmark } from 'lucide-react';

export default function ChatWidget({ user, supabase, favorites = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // View states: 'list' (recent chats/search) or 'room' (chatting with specific user)
  const [viewState, setViewState] = useState('list');
  
  // Data states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Chat room states
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showVocabPicker, setShowVocabPicker] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Subscribe to incoming messages
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        const newMsg = payload.new;
        // If we are currently chatting with the sender, append message
        if (viewState === 'room' && activeChatUser && newMsg.sender_id === activeChatUser.id) {
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        } else {
          // Otherwise, increment unread count
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, viewState, activeChatUser]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, viewState]);

  // Search users effect (Debounced)
  useEffect(() => {
    if (!supabase || viewState !== 'list') return;
    
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('chat_users_view')
        .select('*')
        .ilike('display_name', `%${searchQuery}%`)
        .neq('id', user.id)
        .limit(20);
      
      if (data && !error) {
        setSearchResults(data);
      } else if (error) {
        console.error("Search error:", error);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, supabase, user, viewState]);

  // Load chat history when entering a room
  useEffect(() => {
    if (viewState === 'room' && activeChatUser && supabase && user) {
      const loadMessages = async () => {
        setIsLoadingMessages(true);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChatUser.id}),and(sender_id.eq.${activeChatUser.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })
          .limit(50);
          
        if (data && !error) {
          setMessages(data);
        }
        setIsLoadingMessages(false);
      };
      
      loadMessages();
    }
  }, [viewState, activeChatUser, supabase, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser || !user || !supabase) return;

    const msgContent = newMessage.trim();
    setNewMessage(''); // optimistic clear
    
    // Optimistic append
    const tempMsg = {
      id: 'temp-' + Date.now(),
      sender_id: user.id,
      receiver_id: activeChatUser.id,
      content: msgContent,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: activeChatUser.id,
        content: msgContent
      })
      .select()
      .single();
      
    if (data && !error) {
      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
    }
  };

  const handleSendVocab = async (vocabObj) => {
    // If it's a string from old data, handle gracefully
    const wordKey = typeof vocabObj === 'string' ? vocabObj : vocabObj.word;
    const meaning = typeof vocabObj === 'object' ? (vocabObj.meaning || vocabObj.mean) : '';
    const ipa = typeof vocabObj === 'object' ? vocabObj.ipa : '';
    
    let formattedMsg = `📚 Từ vựng: ${wordKey}`;
    if (ipa) formattedMsg += `\n🗣️ ${ipa}`;
    if (meaning) formattedMsg += `\n📖 ${meaning}`;
    
    // Optimistic append
    const tempMsg = {
      id: 'temp-' + Date.now(),
      sender_id: user.id,
      receiver_id: activeChatUser.id,
      content: formattedMsg,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();
    setShowVocabPicker(false);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: activeChatUser.id,
        content: formattedMsg
      })
      .select()
      .single();
      
    if (data && !error) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
    }
  };

  const openChatWithUser = (chatUser) => {
    setActiveChatUser(chatUser);
    setViewState('room');
    setSearchQuery('');
  };

  if (!user) return null; // Don't show chat if not logged in

  return (
    <div className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 flex flex-col items-end">
      
      {/* Chat Window Popup */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[90vw] sm:w-[350px] h-[500px] max-h-[70vh] mb-4 flex flex-col overflow-hidden animate-fadeIn origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#0071E3] text-white p-4 flex justify-between items-center shrink-0">
            {viewState === 'room' ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setViewState('list')}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-sm truncate max-w-[150px]">{activeChatUser?.display_name || 'User'}</h3>
                  <p className="text-xs text-blue-100">Đang trò chuyện</p>
                </div>
              </div>
            ) : (
              <h3 className="font-bold text-lg">Tin nhắn</h3>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
            
            {/* View: List / Search */}
            {viewState === 'list' && (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-white shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Tìm tên người dùng..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-100 rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {isSearching ? (
                    <div className="flex justify-center p-8 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : searchQuery.trim() !== '' ? (
                    searchResults.length > 0 ? (
                      searchResults.map(u => (
                        <button 
                          key={u.id}
                          onClick={() => openChatWithUser(u)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 capitalize">
                            {u.display_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 truncate">
                            <h4 className="font-semibold text-sm text-gray-900 truncate capitalize">{u.display_name}</h4>
                            <p className="text-xs text-gray-500">Nhấn để nhắn tin</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center p-8 text-sm text-gray-500">Không tìm thấy ai</p>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-3">
                      <MessageCircle className="w-12 h-12 opacity-20" />
                      <p className="text-sm">Tìm kiếm tên bạn bè để bắt đầu trò chuyện</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: Chat Room */}
            {viewState === 'room' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 mt-10">Bắt đầu trò chuyện!</p>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-[#0071E3] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Chat Input */}
                <div className="relative border-t bg-white shrink-0 p-2">
                  {showVocabPicker && (
                    <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-2xl max-h-48 overflow-y-auto p-2 z-10 flex flex-col gap-1">
                      <div className="flex justify-between items-center mb-1 px-2 py-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chia sẻ từ đã lưu</span>
                        <button onClick={() => setShowVocabPicker(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {favorites.length > 0 ? favorites.map((f, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleSendVocab(f)}
                          className="text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-xl transition-colors truncate"
                        >
                          <span className="font-semibold text-blue-600">{typeof f === 'string' ? f : f.word}</span>
                          {typeof f === 'object' && f.meaning && <span className="text-gray-500 text-xs ml-2 truncate">- {f.meaning}</span>}
                        </button>
                      )) : (
                        <p className="text-xs text-center text-gray-400 p-2">Chưa có từ nào trong Sổ tay</p>
                      )}
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowVocabPicker(!showVocabPicker)}
                      className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center shrink-0 transition-colors"
                      title="Chia sẻ từ vựng"
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhắn tin..." 
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:bg-gray-50 border border-transparent focus:border-blue-200 transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 rounded-full bg-[#0071E3] text-white flex items-center justify-center disabled:opacity-50 transition-opacity shrink-0 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0); // clear unread on open
        }}
        className="w-14 h-14 bg-[#0071E3] hover:bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 relative"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
