'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Search, Send, ArrowLeft, Loader2, Bookmark, BookmarkCheck } from 'lucide-react';

export default function ChatWidget({ user, supabase, favorites = [], toggleFavorite, isFavorite }) {
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
  const [vocabSearchQuery, setVocabSearchQuery] = useState('');
  
  // Recent chats
  const [recentChats, setRecentChats] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Load recent chats
  useEffect(() => {
    if (!isOpen || viewState !== 'list' || !supabase || !user || searchQuery.trim() !== '') return;
    
    const loadRecentChats = async () => {
      if (recentChats.length === 0) setIsLoadingRecent(true);
      const { data: recentMsgs, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (!error && recentMsgs) {
        const uniqueUserIds = new Set();
        const latestMsgsMap = {};
        
        recentMsgs.forEach(msg => {
          const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          if (!uniqueUserIds.has(otherId)) {
            uniqueUserIds.add(otherId);
            latestMsgsMap[otherId] = msg;
          }
        });
        
        const chatUserIds = Array.from(uniqueUserIds);
        
        if (chatUserIds.length > 0) {
          const { data: usersData } = await supabase
            .from('chat_users_view')
            .select('*')
            .in('id', chatUserIds);
            
          if (usersData) {
             usersData.forEach(u => {
               u.content = latestMsgsMap[u.id].content;
               u.created_at = latestMsgsMap[u.id].created_at;
             });
             usersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
             setRecentChats(usersData);
          }
        } else {
          setRecentChats([]);
        }
      }
      setIsLoadingRecent(false);
    };
    
    loadRecentChats();
  }, [isOpen, viewState, user, supabase, searchQuery]);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const updateRecentChatsWithSentMsg = async (msg) => {
    let found = false;
    setRecentChats(prev => {
      const existingUserIndex = prev.findIndex(u => u.id === msg.receiver_id);
      if (existingUserIndex >= 0) {
        found = true;
        const newList = [...prev];
        const updatedUser = { ...newList[existingUserIndex], content: msg.content, created_at: msg.created_at };
        newList.splice(existingUserIndex, 1);
        newList.unshift(updatedUser);
        return newList;
      }
      return prev;
    });
    
    if (!found) {
      const { data } = await supabase.from('chat_users_view').select('*').eq('id', msg.receiver_id).single();
      if (data) {
        data.content = msg.content;
        data.created_at = msg.created_at;
        setRecentChats(prev => [data, ...prev]);
      }
    }
  };

  const viewStateRef = useRef(viewState);
  useEffect(() => { viewStateRef.current = viewState; }, [viewState]);

  const activeChatUserRef = useRef(activeChatUser);
  useEffect(() => { activeChatUserRef.current = activeChatUser; }, [activeChatUser]);

  const recentChatsRef = useRef(recentChats);
  useEffect(() => { recentChatsRef.current = recentChats; }, [recentChats]);

  // Subscribe to incoming messages
  useEffect(() => {
    if (!user || !supabase) return;

    const channelName = `messages-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, async (payload) => {
        const newMsg = payload.new;
        const currentViewState = viewStateRef.current;
        const currentActiveChatUser = activeChatUserRef.current;
        const currentRecentChats = recentChatsRef.current;

        // If we are currently chatting with the sender, append message and mark as read
        if (currentViewState === 'room' && currentActiveChatUser && newMsg.sender_id === currentActiveChatUser.id) {
          supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id).then();
          newMsg.is_read = true;
          
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        } else {
          // Otherwise, increment unread count
          setUnreadCount(prev => prev + 1);
        }

        // Update recent chats list
        const existingUserIndex = currentRecentChats.findIndex(u => u.id === newMsg.sender_id);
        if (existingUserIndex >= 0) {
          setRecentChats(prev => {
            const newList = [...prev];
            const updatedUser = { ...newList[existingUserIndex], content: newMsg.content, created_at: newMsg.created_at };
            newList.splice(existingUserIndex, 1);
            newList.unshift(updatedUser);
            return newList;
          });
        } else {
          const { data } = await supabase.from('chat_users_view').select('*').eq('id', newMsg.sender_id).single();
          if (data) {
            data.content = newMsg.content;
            data.created_at = newMsg.created_at;
            setRecentChats(prev => [data, ...prev]);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

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
        if (messages.length === 0) setIsLoadingMessages(true);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChatUser.id}),and(sender_id.eq.${activeChatUser.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })
          .limit(50);
          
        if (data && !error) {
          setMessages(data);
          
          // Mark unread messages from this user as read
          const unreadIds = data.filter(m => m.receiver_id === user.id && !m.is_read).map(m => m.id);
          if (unreadIds.length > 0) {
            supabase.from('messages').update({ is_read: true }).in('id', unreadIds).then();
            // Update local state optimisticly
            setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));
          }
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
    chatInputRef.current?.blur(); // close keyboard
    
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
      // Send push notification to receiver
      fetch('/api/web-push/send-chat-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          receiverId: activeChatUser.id, 
          senderId: user.id,
          senderName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Ai đó', 
          content: msgContent 
        })
      }).catch(console.error);

      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      updateRecentChatsWithSentMsg(data);
    }
  };

  const handleSendVocab = async (vocabObj) => {
    // If it's a string from old data, handle gracefully
    const wordKey = typeof vocabObj === 'string' ? vocabObj : vocabObj.word;
    const meaning = typeof vocabObj === 'object' ? (vocabObj.meaning || vocabObj.mean) : '';
    const ipa = typeof vocabObj === 'object' ? vocabObj.ipa : '';
    
    const contentObj = {
      type: 'vocab_card',
      word: wordKey,
      ipa: ipa,
      meaning: meaning
    };
    const finalFormattedMsg = `[VOCAB_CARD]${JSON.stringify(contentObj)}`;
    
    const tempMsg = {
      id: 'temp-' + Date.now(),
      sender_id: user.id,
      receiver_id: activeChatUser.id,
      content: finalFormattedMsg,
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
        content: finalFormattedMsg
      })
      .select()
      .single();
      
    if (data && !error) {
      // Send push notification to receiver
      fetch('/api/web-push/send-chat-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          receiverId: activeChatUser.id, 
          senderId: user.id,
          senderName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Ai đó', 
          content: finalFormattedMsg 
        })
      }).catch(console.error);

      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      updateRecentChatsWithSentMsg(data);
    }
  };

  const openChatWithUser = (chatUser) => {
    if (activeChatUser?.id !== chatUser.id) {
      setMessages([]);
    }
    setActiveChatUser(chatUser);
    setViewState('room');
    setSearchQuery('');
  };

  const processedUrlParam = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || processedUrlParam.current || !supabase || !user) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const chatWithId = searchParams.get('chat_with');
    
    if (chatWithId) {
      processedUrlParam.current = true;
      
      const openChatFromUrl = async () => {
        const { data } = await supabase
          .from('chat_users_view')
          .select('*')
          .eq('id', chatWithId)
          .single();
          
        if (data) {
          setIsOpen(true);
          openChatWithUser(data);
          
          const url = new URL(window.location.href);
          url.searchParams.delete('chat_with');
          window.history.replaceState({}, '', url);
        }
      };
      
      openChatFromUrl();
    }
  }, [supabase, user, isOpen]);

  const renderMessageContent = (msg, isMe) => {
    if (msg.content.startsWith('[VOCAB_CARD]')) {
      try {
        const data = JSON.parse(msg.content.replace('[VOCAB_CARD]', ''));
        const isFav = isFavorite ? isFavorite(data.word) : false;
        
        return (
          <div className={`flex flex-col gap-1 p-2 rounded-xl mt-1 ${isMe ? 'bg-white/10' : 'bg-gray-50 border border-gray-100'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base ${isMe ? 'text-white' : 'text-[#1D1D1F]'}`}>{data.word}</span>
                {data.ipa && <span className={`text-xs ${isMe ? 'text-gray-300' : 'text-gray-500'}`}>{data.ipa}</span>}
              </div>
              {!isMe && toggleFavorite && (
                <button 
                  onClick={() => toggleFavorite(data)}
                  className={`p-1.5 rounded-full transition-colors ${isFav ? 'bg-[#0071E3]/10 text-[#0071E3]' : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'}`}
                >
                  {isFav ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            {data.meaning && <span className={`text-sm ${isMe ? 'text-gray-200' : 'text-gray-600'}`}>{data.meaning}</span>}
          </div>
        );
      } catch (e) {
        return msg.content;
      }
    }
    return msg.content;
  };

  if (!user) return null; // Don't show chat if not logged in

  return (
    <div className={`fixed ${isKeyboardOpen ? 'bottom-2' : 'bottom-20'} sm:bottom-6 right-4 z-50 flex flex-col items-end pointer-events-none transition-all duration-300`}>
      
      {/* Chat Window Popup */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[90vw] sm:w-[350px] h-[500px] max-h-[70dvh] sm:max-h-[70vh] mb-4 flex flex-col overflow-hidden animate-fadeIn origin-bottom-right pointer-events-auto">
          
          {/* Header */}
          <div className="bg-[#1D1D1F] text-white p-4 flex justify-between items-center shrink-0">
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
                  <p className="text-xs text-gray-300">Đang trò chuyện</p>
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
                      className="w-full bg-gray-100 rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-500/20 transition-all"
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
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.display_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-bold shrink-0 capitalize">
                              {u.display_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex-1 truncate">
                            <h4 className="font-semibold text-sm text-gray-900 truncate capitalize">{u.display_name}</h4>
                            <p className="text-xs text-gray-500">Nhấn để nhắn tin</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center p-8 text-sm text-gray-500">Không tìm thấy ai</p>
                    )
                  ) : isLoadingRecent ? (
                    <div className="flex justify-center p-8 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : recentChats.length > 0 ? (
                    recentChats.map(u => (
                      <button 
                        key={u.id}
                        onClick={() => openChatWithUser(u)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors text-left"
                      >
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.display_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-bold shrink-0 capitalize">
                            {u.display_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 truncate">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className={`text-sm truncate capitalize ${u.latestMessage && u.latestMessage.sender_id !== user.id && !u.latestMessage.is_read ? 'font-extrabold text-[#1D1D1F]' : 'font-semibold text-gray-900'}`}>{u.display_name}</h4>
                            {u.latestMessage && (
                              <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                {new Date(u.latestMessage.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            )}
                          </div>
                          {u.latestMessage ? (
                            <p className={`text-xs truncate ${u.latestMessage.sender_id !== user.id && !u.latestMessage.is_read ? 'font-bold text-black' : 'text-gray-500'}`}>
                              {u.latestMessage.sender_id === user.id ? 'Bạn: ' : ''}
                              {u.latestMessage.content.startsWith('[VOCAB_CARD]') ? 'Đã chia sẻ một từ vựng' : u.latestMessage.content}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 truncate">Nhấn để nhắn tin</p>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-3">
                      <MessageCircle className="w-12 h-12 opacity-20" />
                      <p className="text-sm">Chưa có cuộc trò chuyện nào.<br/>Tìm kiếm tên bạn bè để bắt đầu!</p>
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
                      <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 mt-10">Bắt đầu trò chuyện!</p>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user.id;
                      const timeString = new Date(msg.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                      return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                          {!isMe && (
                            activeChatUser?.avatar_url ? (
                              <img src={activeChatUser.avatar_url} alt={activeChatUser.display_name} className="w-8 h-8 rounded-full object-cover shrink-0 mr-2 mt-auto" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-bold shrink-0 capitalize mr-2 mt-auto">
                                {activeChatUser?.display_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )
                          )}
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                            <div className={`rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-[#1D1D1F] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                              {renderMessageContent(msg, isMe)}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1">{timeString}</span>
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
                    <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-2xl max-h-64 flex flex-col z-10">
                      <div className="flex justify-between items-center p-2 border-b border-gray-50">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">Chia sẻ từ đã lưu</span>
                        <button onClick={() => { setShowVocabPicker(false); setVocabSearchQuery(''); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-2 border-b border-gray-50">
                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Tìm từ vựng..." 
                            value={vocabSearchQuery}
                            onChange={(e) => setVocabSearchQuery(e.target.value)}
                            onFocus={() => { setIsKeyboardOpen(true); setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 300); }}
                            onBlur={() => setIsKeyboardOpen(false)}
                            className="w-full bg-gray-50 rounded-lg py-1.5 pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1">
                        {(() => {
                          const reversed = [...favorites].reverse();
                          const isSearching = vocabSearchQuery.trim() !== '';
                          const filtered = isSearching 
                            ? reversed.filter(f => {
                                const w = typeof f === 'string' ? f : f.word;
                                return w.toLowerCase().includes(vocabSearchQuery.toLowerCase());
                              })
                            : reversed.slice(0, 4);

                          if (favorites.length === 0) {
                            return <p className="text-xs text-center text-gray-400 p-2">Chưa có từ nào trong Sổ tay</p>;
                          }
                          if (filtered.length === 0) {
                            return <p className="text-xs text-center text-gray-400 p-2">Không tìm thấy từ nào</p>;
                          }
                          
                          return (
                            <>
                              {filtered.map((f, i) => (
                                <button 
                                  key={i} 
                                  onClick={() => handleSendVocab(f)}
                                  className="text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors truncate"
                                >
                                  <span className="font-semibold text-gray-800">{typeof f === 'string' ? f : f.word}</span>
                                  {typeof f === 'object' && f.meaning && <span className="text-gray-500 text-xs ml-2 truncate">- {f.meaning}</span>}
                                </button>
                              ))}
                              {!isSearching && favorites.length > 4 && (
                                <p className="text-[10px] text-center text-gray-400 mt-1">Tìm kiếm để xem thêm...</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowVocabPicker(!showVocabPicker)}
                      className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:text-gray-800 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors"
                      title="Chia sẻ từ vựng"
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <input 
                      ref={chatInputRef}
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onFocus={() => { setIsKeyboardOpen(true); setTimeout(scrollToBottom, 300); }}
                      onBlur={() => setIsKeyboardOpen(false)}
                      placeholder="Nhắn tin..." 
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:bg-gray-50 border border-transparent focus:border-gray-300 transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center disabled:opacity-50 transition-opacity shrink-0 hover:bg-black"
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
        className="w-14 h-14 bg-[#1D1D1F] hover:bg-black text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 relative"
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
