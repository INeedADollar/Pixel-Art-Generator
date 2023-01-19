import torch
from torch import nn
from torch.nn import Identity
from torchvision import transforms
import functools
from PIL import Image
import numpy as np

from .pixelart_generator import PixelArtGenerator

__all__ = (
    "create_pixel_art",
    "init_ai_engine"
)

net = None
device = None


def tensor2im(input_image, imtype=np.uint8):
    if not isinstance(input_image, np.ndarray):
        if isinstance(input_image, torch.Tensor):
            image_tensor = input_image.data
        else:
            return input_image
        image_numpy = image_tensor[0].cpu().float().numpy()
        if image_numpy.shape[0] == 1:
            image_numpy = np.tile(image_numpy, (3, 1, 1))
        image_numpy = (np.transpose(image_numpy, (1, 2, 0)) + 1) / 2.0 * 255.0
    else:
        image_numpy = input_image
    return image_numpy.astype(imtype)


def create_pixel_art(image_path, save_path):
    real_img_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])

    real_img = Image.open(image_path).convert('RGB')
    real_img = real_img_transform(real_img)
    real_img = real_img.unsqueeze(0).to(device)

    fake_img_tensor = net(real_img)
    fake_img_array = tensor2im(fake_img_tensor)

    fake_image = Image.fromarray(fake_img_array)
    fake_image.save(save_path)


def get_norm_layer(norm_type='instance'):
    if norm_type == 'batch':
        norm_layer = functools.partial(nn.BatchNorm2d, affine=True, track_running_stats=True)
    elif norm_type == 'instance':
        norm_layer = functools.partial(nn.InstanceNorm2d, affine=False, track_running_stats=False)
    elif norm_type == 'none':
        def norm_layer(x): return Identity()
    else:
        raise NotImplementedError('normalization layer [%s] is not found' % norm_type)

    return norm_layer


def init_ai_engine(pretrained_model_path):
    norm_layer = get_norm_layer(norm_type='instance')

    global net
    net = PixelArtGenerator(input_nc=3, output_nc=3, ngf=64, norm_layer=norm_layer, use_dropout=False, n_blocks=9)

    global device
    device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
    gpu_ids = [0] if torch.cuda.is_available() else []

    state_dict = torch.load(pretrained_model_path, map_location=device)

    if len(gpu_ids) > 0:
        assert (torch.cuda.is_available())
        net.to(gpu_ids[0])
        net = torch.nn.DataParallel(net, gpu_ids)  # multi-GPUs

    if isinstance(net, torch.nn.DataParallel):
        net = net.module

    net.load_state_dict(state_dict)
