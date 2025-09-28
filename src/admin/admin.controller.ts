import {
  Body,
  Controller,
  Post,
  Delete,
  Version,
  ParseIntPipe,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiNoContentResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdatePagesPayload } from 'src/book/payload/update-pages-payload';

@Controller('admin')
@ApiTags('Admin API')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: '책 페이지 업데이트' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async updateBookPages(@Body() payload: UpdatePagesPayload): Promise<void> {
    return this.adminService.updateBookPages(payload.bookId, payload.fileName);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(204)
  @ApiOperation({ summary: 'DB에서 책 삭제' })
  @ApiNoContentResponse()
  async deleteBook(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteBook(id);
  }
}
