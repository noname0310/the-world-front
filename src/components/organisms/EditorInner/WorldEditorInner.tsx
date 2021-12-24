import React, { ChangeEventHandler, useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { ReactComponent as PenTool } from '../../atoms/PenTool.svg';
import { ReactComponent as EraseTool } from '../../atoms/EraseTool.svg';
import { ReactComponent as ColliderTool } from '../../atoms/ColliderTool.svg';
import { ReactComponent as ImageTool } from '../../atoms/ImageTool.svg';
import { ReactComponent as SizerTool } from '../../atoms/SizerTool.svg';
import DualTabList, { PhotoElementData } from "../../molecules/DualTabList";
import { Server } from "../../../game/connect/types";

const SIDE_BAR_WIDTH = 130/* px */;
const EXTENDS_BAR_WIDTH = 464/* px */;

const ExpandBarDiv = styled.div<{opened: boolean}>`
    background: #D7CCC8;
    box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.12);
    height: 100%;
    width: ${EXTENDS_BAR_WIDTH}px;
    position: absolute;
    left: ${p => p.opened ? SIDE_BAR_WIDTH : SIDE_BAR_WIDTH - EXTENDS_BAR_WIDTH}px;
    transition: left 0.5s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    pointer-events: all;
`;


const Container = styled.div`
    width: 100%;
    height: calc(100% - 70px);
    
    overflow-y: scroll;
    overflow-y: overlay;

    box-sizing: border-box;

    ::-webkit-scrollbar {
        width: 14px;
        padding: 10px 1px 10px 1px;
    }
    ::-webkit-scrollbar-thumb {
        width: 2px;
        border-radius: 1px;
        background-color: #2E2E2E60;

        background-clip: padding-box;
        border: 6px solid transparent;
        border-bottom: 12px solid transparent;
    }
    ::-webkit-scrollbar-track {
        display: none;
    }

    scrollbar-color: #2E2E2E60 #00000000; // for FF
    scrollbar-width: thin; // for FF
`;

const IframeInputWrapper = styled.div`
    width: 428px;

    margin: 18px;

    display: flex;

    flex-direction: column;
    align-items: center;

    border-radius: 23px;

    background: #A69B97;
`;

const IframeTitle = styled.span`
    margin: 16px;

    font-family: 'Noto Sans';
    font-size: 16px;
    font-weight: 500;
`;

const ListFakeHr = styled.div`
    width: 100%;
    height: 2px;
    background-color: #FFFFFF60;
`;

const IframeInput = styled.input`
    width: calc(100% - 14px);
    height: 42px;

    box-sizing: border-box;

    margin: 7px;
    padding-left: 10px;

    border-radius: 38px;
    border: 0px;
    outline: none;

    background: #FFFFFB;
    box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.12);
`;

const IframeInputSettingWrapper = styled.div`
    width: 100%;
    height: 48px;

    display: flex;
`;

const IframeInputSettingLeft = styled.div`
    width: calc(50% - 1px);
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
`;

const VerticalLine = styled.div`
    width: 0px;
    height: 48px;

    border: 1px solid rgba(255, 255, 255, 0.6);
`;

const IframeInputSettingRight = styled.div`
    width: calc(50% - 1px);
    height: 100%;

    display: flex;

    flex-direction: center;
    justify-content: center;
    align-items: center;
`;

const IframeInputSettingRightText = styled.span<{selected: boolean}>`
    margin: 16px 18px;

    color: ${p => p.selected ? '#000000' : '#00000060'};
    font-family: Noto Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;

    transition: color 50ms;
`;

const IframeInputSettingRightVerticalLine = styled.div`
    width: 0px;
    height: 24px;

    border: 1px solid rgba(255, 255, 255, 0.6);
`


const ToolsWrapper = styled.div<{selected: number}>`
    width: 100%;
    height: 38px;
    
    display: flex;

    box-sizing: border-box;

    padding-left: 77px;
    margin-bottom: 18px;

    & > svg:nth-child(${p => p.selected + 1}){
        border: 3px solid #A69B97;
    }

    & > svg {
        filter: drop-shadow(5px 5px 20px rgba(0, 0, 0, 0.12));
        margin-right: 10px;

        transition: all 50ms;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid #00000000;

        :hover {
            cursor: pointer;
        }
    }

`



interface PropsType {
    worldId: string;
    opened: boolean;
}

enum Tools {
    Pen,
    Eraser,
    Collider,
    Image,
    Sizer
}

function WorldEditorInner({ worldId, opened }: PropsType) {
    const [tab, setTab] = useState(0);
    const [photoId, setPhotoId] = useState(0);
    const tabNames = useMemo(() => ({left: "Tile List", right: "Object List"}), []);

    const [datas] = useState<{
        left: PhotoElementData[];
        right: PhotoElementData[];
    }>({left: [], right: []});

    const [iframeWidth, setIframeWidth] = useState('1');
    const [iframeHeight, setIframeHeight] = useState('1');
    const [iframeObjectType, setIframeObjectType] = useState(Server.GameObjectType.Wall);
    const isSafeNum = useCallback((num: number) => !isNaN(num) && num >= 0 && num < Infinity, []);

    const [selectedTool, setSelectedTool] = useState(Tools.Pen);
    const onSelectTool = useCallback((tool: Tools) => {
        setSelectedTool(tool);
    }, []);

    return (
        <ExpandBarDiv opened={opened}>
            <Container>
                <DualTabList datas={datas} setId={setPhotoId} id={photoId} tab={tab} setTab={setTab} tabNames={tabNames}/>
                <IframeInputWrapper>
                    <IframeTitle>iframe address</IframeTitle>
                    <ListFakeHr />
                    <IframeInput type="text" placeholder="Add iframe address" />
                    <ListFakeHr />
                    <IframeInputSettingWrapper>
                        <IframeInputSettingLeft>
                            <IframeSettingLeftInput label="W" value={iframeWidth} onChange={e => isSafeNum(+e.target.value) && setIframeWidth(e.target.value)} />
                            <IframeSettingLeftInput label="H" value={iframeHeight} onChange={e => isSafeNum(+e.target.value) && setIframeHeight(e.target.value)} />
                        </IframeInputSettingLeft>
                        <VerticalLine />
                        <IframeInputSettingRight>
                            <IframeInputSettingRightText
                                selected={iframeObjectType === Server.GameObjectType.Wall}
                                onClick={() => setIframeObjectType(Server.GameObjectType.Wall)}
                            >
                                Wall
                            </IframeInputSettingRightText>
                            <IframeInputSettingRightVerticalLine />
                            <IframeInputSettingRightText
                                selected={iframeObjectType === Server.GameObjectType.Floor}
                                onClick={() => setIframeObjectType(Server.GameObjectType.Floor)}
                            >
                                floor
                            </IframeInputSettingRightText>
                            <IframeInputSettingRightVerticalLine />
                            <IframeInputSettingRightText
                                selected={iframeObjectType === Server.GameObjectType.Effect}
                                onClick={() => setIframeObjectType(Server.GameObjectType.Effect)}
                            >
                                effect
                            </IframeInputSettingRightText>
                        </IframeInputSettingRight>
                    </IframeInputSettingWrapper>
                </IframeInputWrapper>
            </Container>
            <ToolsWrapper selected={selectedTool}>
                <PenTool onClick={() => onSelectTool(Tools.Pen)} />
                <EraseTool onClick={() => onSelectTool(Tools.Eraser)} />
                <ColliderTool onClick={() => onSelectTool(Tools.Collider)} />
                <ImageTool onClick={() => onSelectTool(Tools.Image)} />
                <SizerTool onClick={() => onSelectTool(Tools.Sizer)} />
            </ToolsWrapper>
        </ExpandBarDiv>
    );
}


export default React.memo(WorldEditorInner);


const IframeSettingLeftInputWrapper = styled.div`
    width: 70px;
    height: 27px;

    display: flex;

    margin: 10px;

    border-radius: 13.5px;
    filter: drop-shadow(5px 5px 20px rgba(0, 0, 0, 0.12));
`;

const IframeSettingLeftInputLabel = styled.span`
    width: 30px;
    height: 27px;
    line-height: 27px;

    display: flex;
    justify-content: center;
    align-items: center;

    font-family: Noto Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;

    background-color: #FFFFFB;

    border-radius: 13.5px 0px 0px 13.5px;
`;

const IframeSettingLeftInputArea = styled.input`
    width: calc(100% - 30px);
    height: 27px;
    line-height: 27px;

    box-sizing: border-box;

    border: none;
    outline: none;

    background-color: #FFFFFB;

    border-radius: 0px 13.5px 13.5px 0px;
`;

interface IframeSettingLeftInputProps {
    label: string;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>
}

function IframeSettingLeftInput({label, value, onChange}: IframeSettingLeftInputProps) {
    return (
        <IframeSettingLeftInputWrapper>
            <IframeSettingLeftInputLabel>
                {label} :
            </IframeSettingLeftInputLabel>
            <IframeSettingLeftInputArea onChange={onChange} value={value} />
        </IframeSettingLeftInputWrapper>
    )
}