import { useState } from 'react';
import { Screen } from '../../navigation/routes';
import { useChatRoom } from './useChatRoom';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import RoomInfoPanel from './components/RoomInfoPanel';

export default function Chat({ onNavigate }: { onNavigate: (s: Screen) => void }) {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const {
        rooms,
        selectedRoom,
        filteredRooms,
        sortedMessages,
        searchKeyword,
        messageInput,
        isLoadingRooms,
        isLoadingMessages,
        isLoadingMoreMessages,
        hasMoreMessages,
        isSending,
        errorMessage,
        myUserId,
        onlineUserIds,
        messageListRef,
        setSearchKeyword,
        setMessageInput,
        replyTo,
        setReplyTo,
        handleSelectRoom,
        handleSendMessage,
        handleLoadMoreMessages,
        handleRoomLeft,
        handleRoomDeleted,
        handleRoomInfoUpdated,
        memberVersion,
    } = useChatRoom();

    return (
        <div className="flex h-full w-full max-w-[1600px] mx-auto overflow-hidden bg-white shadow-2xl relative">
            <Sidebar
                filteredRooms={filteredRooms}
                selectedRoom={selectedRoom}
                isLoadingRooms={isLoadingRooms}
                searchKeyword={searchKeyword}
                onSearchChange={setSearchKeyword}
                onSelectRoom={(room) => {
                    setIsInfoOpen(false);
                    void handleSelectRoom(room);
                }}
                onNavigate={onNavigate}
            />
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <ChatHeader
                    room={selectedRoom}
                    onToggleInfo={selectedRoom ? () => setIsInfoOpen((v) => !v) : undefined}
                />
                <MessageList
                    messages={sortedMessages}
                    rooms={rooms}
                    isLoading={isLoadingMessages}
                    hasRoom={selectedRoom !== null}
                    hasMore={hasMoreMessages}
                    isLoadingMore={isLoadingMoreMessages}
                    myUserId={myUserId}
                    onlineUserIds={onlineUserIds}
                    listRef={messageListRef}
                    onReply={setReplyTo}
                    onLoadMore={handleLoadMoreMessages}
                />
                <MessageInput
                    value={messageInput}
                    onChange={setMessageInput}
                    onSubmit={handleSendMessage}
                    disabled={!selectedRoom}
                    isSending={isSending}
                    errorMessage={errorMessage}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                />
            </main>
            {isInfoOpen && selectedRoom && (
                <RoomInfoPanel
                    room={selectedRoom}
                    myUserId={myUserId}
                    onlineUserIds={onlineUserIds}
                    onClose={() => setIsInfoOpen(false)}
                    onRoomLeft={handleRoomLeft}
                    onRoomDeleted={handleRoomDeleted}
                    onRoomUpdated={handleRoomInfoUpdated}
                    memberVersion={memberVersion}
                />
            )}
        </div>
    );
}
